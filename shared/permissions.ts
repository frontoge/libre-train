// Canonical, code-defined permission catalog. This is the single source of truth for the
// individual capabilities in the system: the server syncs it into the DB `Permission` table on
// startup (server/database/sync-permission-catalog.ts), the settings UI renders groups against
// it, and server-side checks reference the keys. Devs add new permissions here, with no
// migration needed: new keys are inserted and granted to Administrator on the next server
// start. Admins compose groups from them.

export type PermissionDef = {
	key: string;
	label: string;
	description: string;
};

export type PermissionCategoryDef = {
	key: string;
	label: string;
	permissions: PermissionDef[];
};

export const PERMISSION_CATALOG: PermissionCategoryDef[] = [
	{
		key: 'clients',
		label: 'Clients',
		permissions: [
			{ key: 'clients.view', label: 'View clients', description: 'See client profiles and history.' },
			{ key: 'clients.create', label: 'Create clients', description: 'Add new clients to the system.' },
			{ key: 'clients.edit', label: 'Edit clients', description: 'Update client details and notes.' },
			{ key: 'clients.delete', label: 'Delete clients', description: 'Permanently remove clients.' },
		],
	},
	{
		key: 'training',
		label: 'Training',
		permissions: [
			{ key: 'training.view', label: 'View training plans', description: 'Browse macro / meso / microcycles.' },
			{ key: 'training.create', label: 'Create training plans', description: 'Build new training cycles.' },
			{ key: 'training.edit', label: 'Edit training plans', description: 'Modify routines and planned exercises.' },
			{ key: 'training.delete', label: 'Delete training plans', description: 'Remove training cycles.' },
		],
	},
	{
		key: 'nutrition',
		label: 'Nutrition',
		permissions: [
			{ key: 'nutrition.view', label: 'View diet plans', description: 'See diet plans and logs.' },
			{ key: 'nutrition.manage', label: 'Manage diet plans', description: 'Create and edit diet plans and logs.' },
		],
	},
	{
		key: 'assessments',
		label: 'Assessments',
		permissions: [
			{ key: 'assessments.view', label: 'View assessments', description: 'Read assessment history.' },
			{ key: 'assessments.manage', label: 'Manage assessments', description: 'Record and edit assessments.' },
		],
	},
	{
		key: 'exercises',
		label: 'Exercises',
		permissions: [
			{ key: 'exercises.view', label: 'View exercise library', description: 'Browse the exercise catalog.' },
			{ key: 'exercises.manage', label: 'Manage exercise library', description: 'Add and edit exercises.' },
		],
	},
	{
		key: 'sales',
		label: 'Sales & Contacts',
		permissions: [
			{ key: 'contacts.view', label: 'View contacts', description: 'See leads and contacts.' },
			{ key: 'contacts.manage', label: 'Manage contacts', description: 'Create, edit, and convert contacts.' },
			{ key: 'billing.view', label: 'View billing', description: 'See invoices and payment status.' },
			{ key: 'billing.manage', label: 'Manage billing', description: 'Create invoices and process payments.' },
		],
	},
	{
		key: 'admin',
		label: 'Administration',
		permissions: [
			{ key: 'settings.branding', label: 'Manage branding', description: 'Customize colors, logo, and copy.' },
			{ key: 'settings.users', label: 'Manage users', description: 'Create and manage user accounts.' },
			{ key: 'settings.permissions', label: 'Manage permissions', description: 'Configure permission groups.' },
			{
				key: 'users.reset_password',
				label: 'Reset user passwords',
				description: 'Set a temporary password for another user, forcing them to choose a new one on next sign-in.',
			},
		],
	},
];

// Permission key for resetting another user's password — referenced by the server-side
// authorization check and the client's reset action so the two never drift.
export const PERMISSION_RESET_USER_PASSWORD = 'users.reset_password';

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_CATALOG.flatMap((c) => c.permissions.map((p) => p.key));

export const TOTAL_PERMISSIONS = ALL_PERMISSION_KEYS.length;

// Keys belonging to a category, by category key.
export const permissionKeysForCategory = (categoryKey: string): string[] =>
	PERMISSION_CATALOG.find((c) => c.key === categoryKey)?.permissions.map((p) => p.key) ?? [];

const PERMISSION_BY_KEY: Record<string, PermissionDef> = Object.fromEntries(
	PERMISSION_CATALOG.flatMap((c) => c.permissions.map((p) => [p.key, p]))
);

export const permissionLabel = (key: string): string => PERMISSION_BY_KEY[key]?.label ?? key;
