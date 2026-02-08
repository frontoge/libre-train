import type { MenuProps } from "antd/es/menu/menu";
import type { Dayjs } from "dayjs";

export type MenuItem = Required<MenuProps>['items'][number];

export type NavMenuItem = MenuItem;

export type ClientListMenuItem = MenuItem;

export type DashboardSummaryState = {
    weight?: number | string;
    weightDiff?: number;
    calories?: number | string;
    caloriesDiff?: number;
    bodyFat?: number | string;
    bodyFatDiff?: number;
    leanMass?: number | string;
    leanMassDiff?: number;
    calorieDeficiency?: number | string;
    bmr?: number | string;
    macroAdherence?: number | string;
}

export type ContactEditCreateFormValues = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dob?: Dayjs;
}

export type ClientEditCreateFormValues = {
    height?: number;
    notes?: string;
}

export enum ModalType {
    DeleteClient
};