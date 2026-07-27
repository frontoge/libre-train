// The Permission Groups settings page renders against the canonical, code-defined catalog
// from @libre-train/shared (the same catalog the DB is seeded from). Groups themselves are
// loaded from the API. This module adapts the shared catalog into the shape the page's
// permission Tree expects (leaf `id` = permission key).
import { ALL_PERMISSION_KEYS, PERMISSION_CATALOG as SHARED_CATALOG, TOTAL_PERMISSIONS } from '@libre-train/shared';

export type Permission = {
	id: string;
	label: string;
	description: string;
};

export type PermissionCategory = {
	key: string;
	label: string;
	permissions: Permission[];
};

export const PERMISSION_CATALOG: PermissionCategory[] = SHARED_CATALOG.map((category) => ({
	key: category.key,
	label: category.label,
	permissions: category.permissions.map((permission) => ({
		id: permission.key,
		label: permission.label,
		description: permission.description,
	})),
}));

export const ALL_PERMISSION_IDS: string[] = ALL_PERMISSION_KEYS;

export { TOTAL_PERMISSIONS };

// Palette used when creating a new group.
export const GROUP_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96', '#f5222d'];
