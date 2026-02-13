import { HomeFilled } from "@ant-design/icons";
import { type NavMenuItem } from "../types/types";
import { IoMdPerson } from "react-icons/io";
import { MdSpaceDashboard, MdAssessment } from "react-icons/md";
import { IoMdPersonAdd, IoMdAddCircle } from "react-icons/io";
import { FaListAlt } from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";
import { ImMap } from "react-icons/im";
import { FaRegSquarePlus } from "react-icons/fa6";


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
                icon: <IoMdAddCircle />,
            },
            {
                key: 'assessment_manage',
                label: 'History',
                icon: <FaListAlt />,
            }
        ]
    },
    {
        key: 'plansMenu',
        label: 'Plans',
        icon: <ImMap />,
        children: [
            {
                key: 'plan_manage',
                label: 'Manage Plans',
                icon: <ImMap />
            },
            {
                key: 'plan_new',
                label: 'New Plan',
                icon: <FaRegSquarePlus />,
            }
        ]
    },
    {
        key: 'exercisesMenu',
        label: 'Exercises',
        icon: <GiWeightLiftingUp />,
        children: [
            {
                key: 'exercise_new',
                label: 'Manage Exercises',
                icon: <IoMdAddCircle />,
            }
        ]
    }
];