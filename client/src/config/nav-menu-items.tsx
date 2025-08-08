import { HomeFilled } from "@ant-design/icons";
import { type NavMenuItem } from "../types/types";
import { IoMdPerson } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { IoMdPersonAdd } from "react-icons/io";

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
];