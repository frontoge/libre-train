import { PERMISSION_CATALOG } from '@libre-train/shared';
import { prisma } from './mysql-database';

// The built-in group that should receive every permission. Matches the seed migration.
export const ADMINISTRATOR_GROUP_NAME = 'Administrator';

export type PermissionCatalogSyncResult = {
	added: string[];
	grantedToAdministrator: boolean;
};

// Bring the DB `Permission` table in line with the code-defined PERMISSION_CATALOG
// (shared/permissions.ts) so new permission keys don't need a migration:
//  - every catalog key is upserted, keeping label/description/category current;
//  - keys that did not exist before are granted to the Administrator group.
// Existing group memberships are never touched. Admins may deliberately edit the system
// groups, so only brand-new keys are granted, and only to Administrator. Keys that were
// removed from the catalog are left in place (deleting them would silently strip groups).
export async function syncPermissionCatalog(): Promise<PermissionCatalogSyncResult> {
	const catalog = PERMISSION_CATALOG.flatMap((category) =>
		category.permissions.map((permission) => ({ ...permission, category: category.label }))
	);

	return prisma.$transaction(async (tx) => {
		const existing = await tx.permission.findMany({ select: { key: true } });
		const existingKeys = new Set(existing.map((permission) => permission.key));

		for (const { key, label, description, category } of catalog) {
			await tx.permission.upsert({
				where: { key },
				create: { key, label, description, category },
				update: { label, description, category },
			});
		}

		const added = catalog.map((permission) => permission.key).filter((key) => !existingKeys.has(key));
		if (added.length === 0) {
			return { added, grantedToAdministrator: false };
		}

		const administrator = await tx.permissionGroup.findUnique({
			where: { name: ADMINISTRATOR_GROUP_NAME },
			select: { id: true },
		});
		if (!administrator) {
			return { added, grantedToAdministrator: false };
		}

		const newPermissions = await tx.permission.findMany({ where: { key: { in: added } }, select: { id: true } });
		await tx.permissionGroupPermission.createMany({
			data: newPermissions.map((permission) => ({ permissionGroupId: administrator.id, permissionId: permission.id })),
			skipDuplicates: true,
		});

		return { added, grantedToAdministrator: true };
	});
}
