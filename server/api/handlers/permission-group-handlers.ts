import { CreatePermissionGroupRequest, PermissionGroupWithPermissions, UpdatePermissionGroupRequest } from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';
import { MessageResponse } from '../../types/utilities';

export const handleGetPermissionGroups = async (
	_req: Request,
	res: Response<PermissionGroupWithPermissions[] | MessageResponse>
) => {
	try {
		const groups = await prisma.permissionGroup.findMany({
			include: {
				PermissionGroupPermission: { select: { Permission: { select: { key: true } } } },
				_count: { select: { UserPermissionGroup: true } },
			},
			orderBy: { name: 'asc' },
		});

		const mapped: PermissionGroupWithPermissions[] = groups.map((group) => ({
			id: group.id,
			name: group.name,
			description: group.description ?? undefined,
			color: group.color ?? undefined,
			is_system: group.is_system,
			is_default: group.is_default,
			created_at: dayjs.utc(group.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(group.updated_at).format('YYYY-MM-DD'),
			permissionKeys: group.PermissionGroupPermission.map((link) => link.Permission.key),
			memberCount: group._count.UserPermissionGroup,
		}));

		res.status(200).json(mapped);
	} catch (error) {
		console.error('Error fetching permission groups:', error);
		res.status(500).json({ message: 'An error occurred while fetching permission groups.' });
	}
};

export const handleCreatePermissionGroup = async (
	req: Request<{}, {}, CreatePermissionGroupRequest>,
	res: Response<{ id: number } | MessageResponse>
) => {
	const { name, description, color, is_default, permissionKeys } = req.body;
	try {
		const permissions = await prisma.permission.findMany({
			where: { key: { in: permissionKeys ?? [] } },
			select: { id: true },
		});

		const group = await prisma.permissionGroup.create({
			data: {
				name,
				description: description ?? null,
				color: color ?? null,
				is_default: is_default ?? false,
				PermissionGroupPermission: { create: permissions.map((p) => ({ permissionId: p.id })) },
			},
		});

		res.status(201).json({ id: group.id });
	} catch (error) {
		console.error('Error creating permission group:', error);
		res.status(500).json({ message: 'An error occurred while creating the permission group.' });
	}
};

export const handleUpdatePermissionGroup = async (
	req: Request<{ id: string }, {}, UpdatePermissionGroupRequest>,
	res: Response<MessageResponse>
) => {
	const id = parseInt(req.params.id, 10);
	const { name, description, color, is_default, permissionKeys } = req.body;
	try {
		await prisma.$transaction(async (tx) => {
			await tx.permissionGroup.update({
				where: { id },
				data: {
					name: name ?? undefined,
					description: description ?? undefined,
					color: color ?? undefined,
					is_default: is_default ?? undefined,
				},
			});

			// When a permission set is provided, replace the group's links wholesale.
			if (permissionKeys) {
				const permissions = await tx.permission.findMany({
					where: { key: { in: permissionKeys } },
					select: { id: true },
				});
				await tx.permissionGroupPermission.deleteMany({ where: { permissionGroupId: id } });
				if (permissions.length) {
					await tx.permissionGroupPermission.createMany({
						data: permissions.map((p) => ({ permissionGroupId: id, permissionId: p.id })),
					});
				}
			}
		});

		res.status(204).send();
	} catch (error) {
		console.error('Error updating permission group:', error);
		res.status(500).json({ message: 'An error occurred while updating the permission group.' });
	}
};

export const handleDeletePermissionGroup = async (req: Request<{ id: string }>, res: Response<MessageResponse>) => {
	const id = parseInt(req.params.id, 10);
	try {
		const group = await prisma.permissionGroup.findUnique({
			where: { id },
			select: { is_system: true, _count: { select: { UserPermissionGroup: true } } },
		});

		if (!group) {
			res.status(404).json({ message: 'Permission group not found.' });
			return;
		}
		if (group.is_system) {
			res.status(403).json({ message: 'System groups cannot be deleted.' });
			return;
		}
		if (group._count.UserPermissionGroup > 0) {
			res.status(409).json({ message: 'Reassign this group’s members before deleting it.' });
			return;
		}

		await prisma.permissionGroup.delete({ where: { id } });
		res.status(204).send();
	} catch (error) {
		console.error('Error deleting permission group:', error);
		res.status(500).json({ message: 'An error occurred while deleting the permission group.' });
	}
};
