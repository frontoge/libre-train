import { HomeFilled } from "@ant-design/icons";
import { type NavMenuItem } from "../types/types";
import { MdSpaceDashboard, MdAssessment } from "react-icons/md";
import { IoMdPersonAdd, IoMdPerson } from "react-icons/io";
import { FaListAlt } from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";
import { ImMap } from "react-icons/im";
import { FaSquarePlus, FaMagnifyingGlass, FaCalendarXmark } from "react-icons/fa6";


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
            },
            {
                key: 'client_new',
                label: 'New Client',
                icon: <IoMdPersonAdd />,
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
            },
            {
                key: 'assessment_manage',
                label: 'History',
                icon: <FaListAlt />,
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
            },
            {
                key: 'training_plan_manage',
                label: 'Browse Plans',
                icon: <FaListAlt />
            },
            {
                key: 'training_plan_snapshot',
                label: "Today's Plan",
                icon: <FaCalendarXmark />
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
            }
        ]
    }
];