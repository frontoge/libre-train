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
					},
					{
						key: 'client_new',
						label: 'New Client',
						icon: <IoMdPersonAdd />,
						urlPath: '/clients/create',
					},
					{
						key: 'client_browse',
						label: 'Browse Clients',
						icon: <FaListAlt />,
						urlPath: '/clients/browse',
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
					},
					{
						key: 'assessment_manage',
						label: 'History',
						icon: <FaListAlt />,
						urlPath: '/assessments/',
					},
				],
			},
			{
				key: 'goals',
				label: 'Goals',
				icon: <FaBullseye />,
				urlPath: '/goals',
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
					},
					{
						key: 'training_plan_manage',
						label: 'Browse Plans',
						icon: <FaListAlt />,
						urlPath: '/training/',
					},
					{
						key: 'training_plan_snapshot',
						label: "Today's Plan",
						icon: <FaCalendarXmark />,
						urlPath: '/training/view',
					},
				],
			},
			{
				key: 'exercise_manage',
				label: 'Exercises',
				icon: <GiWeightLiftingUp />,
				urlPath: '/exercises/',
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
			},
			{
				key: 'log_diet',
				label: 'Diet Log',
				icon: <FaPencilAlt />,
				urlPath: '/diet/log',
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
			},
			{
				key: 'permission_groups',
				label: 'Permissions',
				icon: <FaShieldAlt />,
				urlPath: '/settings/permissions',
			},
			{
				key: 'settings_customization',
				label: 'Customization',
				icon: <FaPalette />,
				urlPath: '/settings/customization',
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
