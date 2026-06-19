// Mock permission catalog + seed groups for the Permission Groups settings page.
// There is no backend for this yet — everything here is in-memory sample data so the
// admin UI (create / edit / view / assign) can be exercised end to end.

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

export type PermissionGroup = {
	id: string;
	name: string;
	description: string;
	color: string;
	permissionIds: string[];
	memberCount: number;
	/** System groups ship with the app and cannot be deleted. */
	isSystem?: boolean;
};

// Grouped by the product area each permission governs.
export const PERMISSION_CATALOG: PermissionCategory[] = [
	{
		key: 'clients',
		label: 'Clients',
		permissions: [
			{ id: 'clients.view', label: 'View clients', description: 'See client profiles and history.' },
			{ id: 'clients.create', label: 'Create clients', description: 'Add new clients to the system.' },
			{ id: 'clients.edit', label: 'Edit clients', description: 'Update client details and notes.' },
			{ id: 'clients.delete', label: 'Delete clients', description: 'Permanently remove clients.' },
		],
	},
	{
		key: 'training',
		label: 'Training',
		permissions: [
			{ id: 'training.view', label: 'View training plans', description: 'Browse macro / meso / microcycles.' },
			{ id: 'training.create', label: 'Create training plans', description: 'Build new training cycles.' },
			{ id: 'training.edit', label: 'Edit training plans', description: 'Modify routines and planned exercises.' },
			{ id: 'training.delete', label: 'Delete training plans', description: 'Remove training cycles.' },
		],
	},
	{
		key: 'nutrition',
		label: 'Nutrition',
		permissions: [
			{ id: 'nutrition.view', label: 'View diet plans', description: 'See diet plans and logs.' },
			{ id: 'nutrition.manage', label: 'Manage diet plans', description: 'Create and edit diet plans and logs.' },
		],
	},
	{
		key: 'assessments',
		label: 'Assessments',
		permissions: [
			{ id: 'assessments.view', label: 'View assessments', description: 'Read assessment history.' },
			{ id: 'assessments.manage', label: 'Manage assessments', description: 'Record and edit assessments.' },
		],
	},
	{
		key: 'exercises',
		label: 'Exercises',
		permissions: [
			{ id: 'exercises.view', label: 'View exercise library', description: 'Browse the exercise catalog.' },
			{ id: 'exercises.manage', label: 'Manage exercise library', description: 'Add and edit exercises.' },
		],
	},
	{
		key: 'sales',
		label: 'Sales & Contacts',
		permissions: [
			{ id: 'contacts.view', label: 'View contacts', description: 'See leads and contacts.' },
			{ id: 'contacts.manage', label: 'Manage contacts', description: 'Create, edit, and convert contacts.' },
			{ id: 'billing.view', label: 'View billing', description: 'See invoices and payment status.' },
			{ id: 'billing.manage', label: 'Manage billing', description: 'Create invoices and process payments.' },
		],
	},
	{
		key: 'admin',
		label: 'Administration',
		permissions: [
			{ id: 'settings.branding', label: 'Manage branding', description: 'Customize colors, logo, and copy.' },
			{ id: 'settings.users', label: 'Manage users', description: 'Create and manage user accounts.' },
			{ id: 'settings.permissions', label: 'Manage permissions', description: 'Configure permission groups.' },
		],
	},
];

export const ALL_PERMISSION_IDS: string[] = PERMISSION_CATALOG.flatMap((c) => c.permissions.map((p) => p.id));

export const TOTAL_PERMISSIONS = ALL_PERMISSION_IDS.length;

const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
	PERMISSION_CATALOG.flatMap((c) => c.permissions.map((p) => [p.id, p.label]))
);

export const permissionLabel = (id: string): string => PERMISSION_LABELS[id] ?? id;

// Palette used for new groups (and the seed groups below).
export const GROUP_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96', '#f5222d'];

export const SEED_GROUPS: PermissionGroup[] = [
	{
		id: 'grp-admin',
		name: 'Administrator',
		description: 'Full access to every area of the system.',
		color: '#f5222d',
		permissionIds: [...ALL_PERMISSION_IDS],
		memberCount: 2,
		isSystem: true,
	},
	{
		id: 'grp-trainer',
		name: 'Trainer',
		description: 'Day-to-day coaching: clients, training, nutrition, and assessments.',
		color: '#1677ff',
		permissionIds: [
			'clients.view',
			'clients.create',
			'clients.edit',
			'training.view',
			'training.create',
			'training.edit',
			'nutrition.view',
			'nutrition.manage',
			'assessments.view',
			'assessments.manage',
			'exercises.view',
			'contacts.view',
		],
		memberCount: 8,
	},
	{
		id: 'grp-frontdesk',
		name: 'Front Desk',
		description: 'Reception and sales: contacts, scheduling, and billing.',
		color: '#fa8c16',
		permissionIds: ['clients.view', 'contacts.view', 'contacts.manage', 'billing.view', 'billing.manage'],
		memberCount: 3,
	},
	{
		id: 'grp-readonly',
		name: 'Read Only',
		description: 'View-only access across the system for auditors and observers.',
		color: '#13c2c2',
		permissionIds: ALL_PERMISSION_IDS.filter((id) => id.endsWith('.view')),
		memberCount: 1,
	},
];
