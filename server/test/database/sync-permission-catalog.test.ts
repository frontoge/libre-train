import { ALL_PERMISSION_KEYS, PERMISSION_CATALOG } from '@libre-train/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../database/mysql-database';
import { syncPermissionCatalog } from '../../database/sync-permission-catalog';

const tx = {
	permission: {
		findMany: vi.fn(),
		upsert: vi.fn(),
	},
	permissionGroup: {
		findUnique: vi.fn(),
	},
	permissionGroupPermission: {
		createMany: vi.fn(),
	},
};

vi.mock('../../database/mysql-database', () => ({
	prisma: {
		$transaction: vi.fn(),
	},
}));

describe('syncPermissionCatalog', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Run the interactive-transaction callback against the mocked `tx` client.
		// eslint-disable-next-line no-unused-vars -- base rule misreads parameter names in TS function types
		const runInTransaction = (fn: (client: typeof tx) => Promise<unknown>) => fn(tx);
		vi.mocked(prisma.$transaction).mockImplementation(runInTransaction as unknown as typeof prisma.$transaction);
	});

	it('upserts every catalog permission with its category label', async () => {
		tx.permission.findMany.mockResolvedValueOnce(ALL_PERMISSION_KEYS.map((key) => ({ key })));

		await syncPermissionCatalog();

		expect(tx.permission.upsert).toHaveBeenCalledTimes(ALL_PERMISSION_KEYS.length);
		const admin = PERMISSION_CATALOG.find((c) => c.key === 'admin')!;
		const branding = admin.permissions.find((p) => p.key === 'settings.branding')!;
		expect(tx.permission.upsert).toHaveBeenCalledWith({
			where: { key: 'settings.branding' },
			create: { key: 'settings.branding', label: branding.label, description: branding.description, category: admin.label },
			update: { label: branding.label, description: branding.description, category: admin.label },
		});
	});

	it('grants nothing when no keys are new', async () => {
		tx.permission.findMany.mockResolvedValueOnce(ALL_PERMISSION_KEYS.map((key) => ({ key })));

		const result = await syncPermissionCatalog();

		expect(result).toEqual({ added: [], grantedToAdministrator: false });
		expect(tx.permissionGroup.findUnique).not.toHaveBeenCalled();
		expect(tx.permissionGroupPermission.createMany).not.toHaveBeenCalled();
	});

	it('grants only newly added keys to the Administrator group', async () => {
		const existing = ALL_PERMISSION_KEYS.filter((key) => key !== 'users.reset_password');
		tx.permission.findMany
			.mockResolvedValueOnce(existing.map((key) => ({ key })))
			.mockResolvedValueOnce([{ id: 42 }]);
		tx.permissionGroup.findUnique.mockResolvedValueOnce({ id: 1 });

		const result = await syncPermissionCatalog();

		expect(result).toEqual({ added: ['users.reset_password'], grantedToAdministrator: true });
		expect(tx.permission.findMany).toHaveBeenLastCalledWith({
			where: { key: { in: ['users.reset_password'] } },
			select: { id: true },
		});
		expect(tx.permissionGroupPermission.createMany).toHaveBeenCalledWith({
			data: [{ permissionGroupId: 1, permissionId: 42 }],
			skipDuplicates: true,
		});
	});

	it('still adds new keys when the Administrator group is missing', async () => {
		tx.permission.findMany.mockResolvedValueOnce([]);
		tx.permissionGroup.findUnique.mockResolvedValueOnce(null);

		const result = await syncPermissionCatalog();

		expect(result.added).toEqual(ALL_PERMISSION_KEYS);
		expect(result.grantedToAdministrator).toBe(false);
		expect(tx.permissionGroupPermission.createMany).not.toHaveBeenCalled();
	});
});
