import { HomeFilled } from '@ant-design/icons';
import { FaAddressBook, FaBullseye, FaListAlt, FaPencilAlt, FaShieldAlt, FaUsersCog } from 'react-icons/fa';
import { FaCalendarXmark, FaPalette, FaSquarePlus } from 'react-icons/fa6';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { ImMap } from 'react-icons/im';
import { IoMdPerson, IoMdPersonAdd } from 'react-icons/io';
import { MdAssessment, MdSpaceDashboard } from 'react-icons/md';
import { RiLogoutBoxRFill } from 'react-icons/ri';
import { SiMealie } from 'react-icons/si';
import { type NavMenuItem } from '../types/types';

// Structure: business-function groups (no icon) → collapsible submenus / leaf items (icons).
export const items: NavMenuItem[] = [
	{
		key: 'dashboard',
		label: 'Home',
		icon: <HomeFilled />,
		urlPath: '/',
	},
	{
		key: 'clientsGroup',
		type: 'group',
		label: 'Clients',
		children: [
			{
				key: 'clientsMenu',
				label: 'Clients',
				icon: <IoMdPerson />,
				children: [
					{
						key: 'client_overview',
						label: 'Dashboard',
						icon: <MdSpaceDashboard />,
						urlPath: '/clients/',
						requiredPermission: 'clients.view',
					},
					{
						key: 'client_new',
						label: 'New Client',
						icon: <IoMdPersonAdd />,
						urlPath: '/clients/create',
						requiredPermission: 'clients.create',
					},
					{
						key: 'client_browse',
						label: 'Browse Clients',
						icon: <FaListAlt />,
						urlPath: '/clients/browse',
						requiredPermission: 'clients.view',
					},
				],
			},
			{
				key: 'assessmentsMenu',
				label: 'Assessments',
				icon: <MdAssessment />,
				children: [
					{
						key: 'assessment_new',
						label: 'New',
						icon: <FaSquarePlus />,
						urlPath: '/assessments/create',
						requiredPermission: 'assessments.manage',
					},
					{
						key: 'assessment_manage',
						label: 'History',
						icon: <FaListAlt />,
						urlPath: '/assessments/',
						requiredPermission: 'assessments.view',
					},
				],
			},
			{
				key: 'goals',
				label: 'Goals',
				icon: <FaBullseye />,
				urlPath: '/goals',
				requiredPermission: 'clients.view',
			},
		],
	},
	{
		key: 'trainingGroup',
		type: 'group',
		label: 'Training',
		children: [
			{
				key: 'trainingMenu',
				label: 'Training Plans',
				icon: <ImMap />,
				children: [
					{
						key: 'training_plan_new',
						label: 'New Plan',
						icon: <FaSquarePlus />,
						urlPath: '/training/create',
						requiredPermission: 'training.create',
					},
					{
						key: 'training_plan_manage',
						label: 'Browse Plans',
						icon: <FaListAlt />,
						urlPath: '/training/',
						requiredPermission: 'training.view',
					},
					{
						key: 'training_plan_snapshot',
						label: "Today's Plan",
						icon: <FaCalendarXmark />,
						urlPath: '/training/view',
						requiredPermission: 'training.view',
					},
				],
			},
			{
				key: 'exercise_manage',
				label: 'Exercises',
				icon: <GiWeightLiftingUp />,
				urlPath: '/exercises/',
				requiredPermission: 'exercises.view',
			},
		],
	},
	{
		key: 'nutritionGroup',
		type: 'group',
		label: 'Nutrition',
		children: [
			{
				key: 'diet_plan_browse',
				label: 'Diet Plans',
				icon: <SiMealie />,
				urlPath: '/diet/plans',
				requiredPermission: 'nutrition.view',
			},
			{
				key: 'log_diet',
				label: 'Diet Log',
				icon: <FaPencilAlt />,
				urlPath: '/diet/log',
				requiredPermission: 'nutrition.manage',
			},
		],
	},
	{
		key: 'salesGroup',
		type: 'group',
		label: 'Sales',
		children: [
			{
				key: 'contacts_browse',
				label: 'Contacts',
				icon: <FaAddressBook />,
				urlPath: '/contacts',
				requiredPermission: 'contacts.view',
			},
		],
	},
	{
		key: 'settingsGroup',
		type: 'group',
		label: 'Settings',
		children: [
			{
				key: 'user_management',
				label: 'User Management',
				icon: <FaUsersCog />,
				urlPath: '/settings/users',
				requiredPermission: 'settings.users',
			},
			{
				key: 'permission_groups',
				label: 'Permissions',
				icon: <FaShieldAlt />,
				urlPath: '/settings/permissions',
				requiredPermission: 'settings.permissions',
			},
			{
				key: 'settings_customization',
				label: 'Customization',
				icon: <FaPalette />,
				urlPath: '/settings/customization',
				requiredPermission: 'settings.branding',
			},
			{
				key: 'logout',
				label: 'Logout',
				icon: <RiLogoutBoxRFill />,
				urlPath: '/logout',
			},
		],
	},
];

// Filter the menu tree down to what the user may access. A leaf is dropped when its
// requiredPermission isn't met; a container (group/submenu) is dropped when it fails its own
// requirement or none of its children survive. Items with no requirement and no children
// (Home, Logout) are always kept. New permissions integrate by tagging items above — no change
// here.
export const filterNavItems = (
	list: NavMenuItem[],
	isAllowed: (requirement: string | string[] | undefined) => boolean
): NavMenuItem[] => {
	const result: NavMenuItem[] = [];
	for (const item of list) {
		if (!item) continue;
		if (!isAllowed(item.requiredPermission)) continue;
		if (item.children) {
			const children = filterNavItems(item.children, isAllowed);
			if (children.length > 0) {
				result.push({ ...item, children } as NavMenuItem);
			}
			continue;
		}
		result.push(item);
	}
	return result;
};

// Recursive lookup so deeply-nested leaves (group → submenu → item) resolve their urlPath.
export const getNavItemByKey = (key: string, list: NavMenuItem[] = items): NavMenuItem | undefined => {
	for (const item of list) {
		if (!item) continue;
		if ('key' in item && item.key === key) {
			return item as NavMenuItem;
		}
		if (item.children) {
			const found = getNavItemByKey(key, item.children);
			if (found) return found;
		}
	}
	return undefined;
};

// Key of the collapsible submenu (NOT a group) that contains the given leaf key, if any.
// Used to auto-expand the active submenu.
export const getParentSubmenuKey = (
	targetKey: string,
	list: NavMenuItem[] = items,
	ancestorSubmenuKey?: string
): string | undefined => {
	for (const item of list) {
		if (!item) continue;
		if ('key' in item && item.key === targetKey) {
			return ancestorSubmenuKey;
		}
		if (item.children) {
			const isSubmenu = item.type !== 'group';
			const nextAncestor = isSubmenu && 'key' in item ? String(item.key) : ancestorSubmenuKey;
			const found = getParentSubmenuKey(targetKey, item.children, nextAncestor);
			if (found) return found;
		}
	}
	return undefined;
};
