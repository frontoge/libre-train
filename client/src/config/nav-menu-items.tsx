import { HomeFilled } from "@ant-design/icons";
import { type NavMenuItem } from "../types/types";
import { MdSpaceDashboard, MdAssessment } from "react-icons/md";
import { IoMdPersonAdd, IoMdPerson } from "react-icons/io";
import { FaListAlt } from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";
import { ImMap } from "react-icons/im";
import { FaSquarePlus, FaMagnifyingGlass, FaCalendarXmark } from "react-icons/fa6";
import { SiMealie } from "react-icons/si";


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
                urlPath: '/clients/'
            },
            {
                key: 'client_new',
                label: 'New Client',
                icon: <IoMdPersonAdd />,
                urlPath: '/clients/create'
            },
        ]
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
                urlPath: '/assessments/create'
            },
            {
                key: 'assessment_manage',
                label: 'History',
                icon: <FaListAlt />,
                urlPath: '/assessments/'
            }
        ]
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
                urlPath: '/training/create'
            },
            {
                key: 'training_plan_manage',
                label: 'Browse Plans',
                icon: <FaListAlt />,
                urlPath: '/training/'
            },
            {
                key: 'training_plan_snapshot',
                label: "Today's Plan",
                icon: <FaCalendarXmark />,
                urlPath: '/training/view'
            }
            
        ]
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
                urlPath: '/diet/plans'
            }
        ]
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
                urlPath: '/exercises/'
            }
        ]
    }
];

export const getNavItemByKey = (key: string): NavMenuItem | undefined => {
    for (const item of items) {
        if (item.key === key) {
            return item;
        }
        if (item.children) {
            const childItem = item.children.find(child => child?.key === key);
            if (childItem && 'key' in childItem) {
                return childItem as NavMenuItem;
            }
        }
    }
}