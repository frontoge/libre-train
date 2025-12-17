import { HomeFilled } from "@ant-design/icons";
import { type NavMenuItem } from "../types/types";
import { IoMdPerson } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { IoMdPersonAdd, IoMdAddCircle } from "react-icons/io";
import { GiWeightLiftingUp } from "react-icons/gi";


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
        key: 'exercisesMenu',
        label: 'Exercises',
        icon: <GiWeightLiftingUp />,
        children: [
            {
                key: 'exercise_new',
                label: 'Manager Exercises',
                icon: <IoMdAddCircle />,
            }
        ]
    }
];