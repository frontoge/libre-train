import {
	CreateUserRequest,
	EffectivePermissionsResponse,
	PERMISSION_RESET_USER_PASSWORD,
	UpdateUserGroupsRequest,
	UserWithContact,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';
import { MessageResponse } from '../../types/utilities';
import { getAuthenticatedUserId, hashPassword, validatePasswordStrength } from './auth-handlers';

// True when the given user holds the permission key, per the UserEffectivePermission view.
async function userHasPermission(userId: number, permissionKey: string): Promise<boolean> {
	const match = await prisma.userEffectivePermission.findFirst({
		where: { userId, permissionKey },
		select: { userId: true },
	});
	return match !== null;
}

// Shared selection + mapping so created users serialize identically to the list endpoint.
const userWithContactSelect = {
	id: true,
	username: true,
	created_at: true,
	updated_at: true,
	contactId: true,
	must_change_password: true,
	Contact: {
		select: { first_name: true, last_name: true, email: true, phone: true, img: true },
	},
	UserPermissionGroup: {
		select: {
			PermissionGroup: { select: { id: true, name: true, color: true, is_default: true } },
		},
		orderBy: { PermissionGroup: { name: 'asc' as const } },
	},
} as const;

type UserWithContactRow = {
	id: number;
	username: string;
	created_at: Date;
	updated_at: Date;
	contactId: number;
	must_change_password: boolean;
	Contact: { first_name: string; last_name: string; email: string; phone: string | null; img: string | null };
	UserPermissionGroup: {
		PermissionGroup: { id: number; name: string; color: string | null; is_default: boolean };
	}[];
};

const mapUser = (user: UserWithContactRow): UserWithContact => ({
	id: user.id,
	username: user.username,
	contactId: user.contactId,
	must_change_password: user.must_change_password,
	created_at: dayjs.utc(user.created_at).format('YYYY-MM-DD'),
	updated_at: dayjs.utc(user.updated_at).format('YYYY-MM-DD'),
	first_name: user.Contact.first_name,
	last_name: user.Contact.last_name,
	email: user.Contact.email,
	phone: user.Contact.phone ?? undefined,
	img: user.Contact.img ?? undefined,
	groups: user.UserPermissionGroup.map(({ PermissionGroup: group }) => ({
		id: group.id,
		name: group.name,
		color: group.color ?? undefined,
		is_default: group.is_default,
	})),
});

export const handleGetUsers = async (_req: Request, res: Response<UserWithContact[] | MessageResponse>) => {
	try {
		// Never select `pass` (the password hash); pull the linked Contact for identity fields
		// and the permission groups the user belongs to.
		const users = await prisma.user.findMany({
			select: userWithContactSelect,
			orderBy: { id: 'asc' },
		});

		res.status(200).json(users.map(mapUser));
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error fetching users:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error fetching users:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};

// The effective permissions of the signed-in user — the union of every permission key granted
// by the groups they belong to, resolved by the UserEffectivePermission DB view. The client
// uses this to gate navigation, routes, and in-page actions.
export const handleGetMyPermissions = async (req: Request, res: Response<EffectivePermissionsResponse | MessageResponse>) => {
	const userId = getAuthenticatedUserId(req);
	if (userId === null) {
		res.status(401).json({ message: 'Authentication required' });
		return;
	}

	try {
		const rows = await prisma.userEffectivePermission.findMany({
			where: { userId },
			select: { permissionKey: true },
		});
		res.status(200).json({ permissions: rows.map((row) => row.permissionKey) });
	} catch (error) {
		console.error('Error fetching user permissions:', error);
		res.status(500).json({ message: 'An error occurred while fetching permissions.' });
	}
};

// Replace the full set of permission groups a user belongs to. Enforces the "at least one
// group per user" invariant at the application layer.
export const handleUpdateUserGroups = async (
	req: Request<{ id: string }, {}, UpdateUserGroupsRequest>,
	res: Response<MessageResponse>
) => {
	const userId = parseInt(req.params.id, 10);
	const { groupIds } = req.body;

	if (!Array.isArray(groupIds) || groupIds.length === 0) {
		res.status(400).json({ message: 'A user must belong to at least one permission group.' });
		return;
	}

	try {
		const uniqueGroupIds = [...new Set(groupIds)];

		// Validate every group exists before mutating, so a bad id fails cleanly.
		const existing = await prisma.permissionGroup.count({ where: { id: { in: uniqueGroupIds } } });
		if (existing !== uniqueGroupIds.length) {
			res.status(400).json({ message: 'One or more permission groups do not exist.' });
			return;
		}

		await prisma.$transaction([
			prisma.userPermissionGroup.deleteMany({ where: { userId } }),
			prisma.userPermissionGroup.createMany({
				data: uniqueGroupIds.map((permissionGroupId) => ({ userId, permissionGroupId })),
			}),
		]);

		res.status(204).send();
	} catch (error) {
		console.error('Error updating user groups:', error);
		res.status(500).json({ message: 'An error occurred while updating the user’s groups.' });
	}
};

// Admin creation of a login account: provisions the linked Contact and the User in one
// transaction. The supplied password is temporary — the account is flagged
// must_change_password so the user is forced onto the set-password screen on first sign-in.
// Default permission groups are assigned to satisfy the "at least one group" invariant.
export const handleCreateUser = async (
	req: Request<{}, {}, CreateUserRequest>,
	res: Response<UserWithContact | MessageResponse>
) => {
	const { firstName, lastName, email, phone, username, password } = req.body ?? {};

	const trimmedFirst = firstName?.trim();
	const trimmedLast = lastName?.trim();
	const trimmedEmail = email?.trim();
	const trimmedUsername = username?.trim();

	if (!trimmedFirst || !trimmedLast) {
		res.status(400).json({ message: 'First and last name are required.' });
		return;
	}
	if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
		res.status(400).json({ message: 'A valid email is required.' });
		return;
	}
	if (!trimmedUsername || trimmedUsername.length < 3 || trimmedUsername.length > 32) {
		res.status(400).json({ message: 'Username must be between 3 and 32 characters.' });
		return;
	}
	const passwordError = validatePasswordStrength(password);
	if (passwordError) {
		res.status(400).json({ message: passwordError });
		return;
	}

	try {
		const [existingUser, existingContact] = await Promise.all([
			prisma.user.findFirst({ where: { username: trimmedUsername } }),
			prisma.contact.findUnique({ where: { email: trimmedEmail } }),
		]);
		if (existingUser) {
			res.status(409).json({ message: 'That username is already taken.' });
			return;
		}
		if (existingContact) {
			res.status(409).json({ message: 'A contact with that email already exists.' });
			return;
		}

		const passwordHash = await hashPassword(password);
		const defaultGroups = await prisma.permissionGroup.findMany({
			where: { is_default: true },
			select: { id: true },
		});

		const created = await prisma.$transaction(async (tx) => {
			const contact = await tx.contact.create({
				data: {
					first_name: trimmedFirst,
					last_name: trimmedLast,
					email: trimmedEmail,
					phone: phone?.trim() || null,
				},
			});

			const user = await tx.user.create({
				data: {
					username: trimmedUsername,
					pass: passwordHash,
					must_change_password: true,
					contactId: contact.id,
				},
			});

			if (defaultGroups.length > 0) {
				await tx.userPermissionGroup.createMany({
					data: defaultGroups.map((group) => ({ userId: user.id, permissionGroupId: group.id })),
				});
			}

			return tx.user.findUniqueOrThrow({ where: { id: user.id }, select: userWithContactSelect });
		});

		res.status(201).json(mapUser(created));
	} catch (error) {
		console.error('Error creating user:', error);
		res.status(500).json({ message: 'An error occurred while creating the user.' });
	}
};

// An admin (anyone holding users.reset_password) sets a temporary password for another user.
// The target is flagged must_change_password, so they're forced onto the set-password screen
// on next sign-in. Authorization is enforced server-side here — the only data route to do so —
// because resetting credentials is sensitive enough not to trust the client alone.
export const handleResetUserPassword = async (
	req: Request<{ id: string }, {}, { password?: string }>,
	res: Response<MessageResponse>
) => {
	const callerId = getAuthenticatedUserId(req);
	if (callerId === null) {
		res.status(401).json({ message: 'Authentication required' });
		return;
	}

	if (!(await userHasPermission(callerId, PERMISSION_RESET_USER_PASSWORD))) {
		res.status(403).json({ message: 'You do not have permission to reset user passwords.' });
		return;
	}

	const targetId = parseInt(req.params.id, 10);
	if (!Number.isInteger(targetId)) {
		res.status(400).json({ message: 'Invalid user id.' });
		return;
	}

	const passwordError = validatePasswordStrength(req.body.password);
	if (passwordError) {
		res.status(400).json({ message: passwordError });
		return;
	}

	try {
		const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } });
		if (!target) {
			res.status(404).json({ message: 'User not found.' });
			return;
		}

		const passwordHash = await hashPassword(req.body.password!);
		await prisma.user.update({
			where: { id: targetId },
			data: { pass: passwordHash, must_change_password: true },
		});

		res.status(200).json({ message: 'Password reset. The user must set a new password on next sign-in.' });
	} catch (error) {
		console.error('Error resetting user password:', error);
		res.status(500).json({ message: 'An error occurred while resetting the password.' });
	}
};
