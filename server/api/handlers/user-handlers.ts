import { UpdateUserGroupsRequest, UserWithContact } from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';
import { MessageResponse } from '../../types/utilities';

export const handleGetUsers = async (_req: Request, res: Response<UserWithContact[] | MessageResponse>) => {
	try {
		// Never select `pass` (the password hash); pull the linked Contact for identity fields
		// and the permission groups the user belongs to.
		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				created_at: true,
				updated_at: true,
				contactId: true,
				Contact: {
					select: { first_name: true, last_name: true, email: true, phone: true, img: true },
				},
				UserPermissionGroup: {
					select: {
						PermissionGroup: { select: { id: true, name: true, color: true, is_default: true } },
					},
					orderBy: { PermissionGroup: { name: 'asc' } },
				},
			},
			orderBy: { id: 'asc' },
		});

		const mappedUsers: UserWithContact[] = users.map((user) => ({
			id: user.id,
			username: user.username,
			contactId: user.contactId,
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
		}));

		res.status(200).json(mappedUsers);
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
