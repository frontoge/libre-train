import { HomeFilled } from '@ant-design/icons';
import { FaListAlt, FaPencilAlt } from 'react-icons/fa';
import { FaCalendarXmark, FaGear, FaMagnifyingGlass, FaSquarePlus } from 'react-icons/fa6';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { ImMap } from 'react-icons/im';
import { IoMdPerson, IoMdPersonAdd } from 'react-icons/io';
import { MdAssessment, MdSpaceDashboard } from 'react-icons/md';
import { RiLogoutBoxRFill } from 'react-icons/ri';
import { SiMealie } from 'react-icons/si';
import { type NavMenuItem } from '../types/types';

export const items: NavMenuItem[] = [
	{
		key: 'dashboard',
		label: 'Home',
		icon: <HomeFilled />,
	},
	{
		type: 'divider',
	},
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
		key: 'dietMenu',
		label: 'Diet',
		icon: <SiMealie />,
		children: [
			{
				key: 'diet_plan_browse',
				label: 'Browse Plans',
				icon: <FaListAlt />,
				urlPath: '/diet/plans',
			},
		],
	},
	{
		key: 'logging',
		label: 'Logging',
		icon: <FaPencilAlt />,
		children: [
			{
				key: 'log_diet',
				label: 'New Diet Log',
				icon: <SiMealie />,
				urlPath: '/diet/log',
			},
		],
	},
	{
		key: 'exercisesMenu',
		label: 'Exercises',
		icon: <GiWeightLiftingUp />,
		children: [
			{
				key: 'exercise_manage',
				label: 'Search',
				icon: <FaMagnifyingGlass />,
				urlPath: '/exercises/',
			},
		],
	},
	{
		key: 'settings',
		label: 'Settings',
		icon: <FaGear />,
		children: [
			{
				key: 'logout',
				label: 'Logout',
				icon: <RiLogoutBoxRFill />,
				urlPath: '/logout',
			},
		],
	},
];

export const getNavItemByKey = (key: string): NavMenuItem | undefined => {
	for (const item of items) {
		if (item.key === key) {
			return item;
		}
		if (item.children) {
			const childItem = item.children.find((child) => child?.key === key);
			if (childItem && 'key' in childItem) {
				return childItem as NavMenuItem;
			}
		}
	}
};
