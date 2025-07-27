import type { MenuProps } from "antd/es/menu/menu";

export type MenuItem = Required<MenuProps>['items'][number];

export type NavMenuItem = MenuItem;

export type ClientListMenuItem = MenuItem;