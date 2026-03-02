import React from "react";

import { type DashboardData } from "../../../shared/types";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

export const defaultDashboardState: DashboardState = {
    selectedDate: dayjs(),
    data: {
        clientId: 0,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        height: 0,
        img: undefined,
        logged_weight: 0,
        logged_calories: undefined,
        logged_body_fat: undefined,
        logged_protein: undefined,
        logged_carbs: undefined,
        logged_fats: undefined,
        target_calories: undefined,
        target_protein: undefined,
        target_carbs: undefined,
        target_fats: undefined,
        goal: undefined,
        goal_weight: undefined,
        goal_bodyFat: undefined,
    },
    isLoading: false,
    setIsLoading: () => {}
};

export type DashboardState = {
    selectedDate: Dayjs,
    data: DashboardData,
    isLoading: boolean,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
}

export const ClientDashboardContext = React.createContext<{
    dashboardState: DashboardState,
    setDashboardState: React.Dispatch<React.SetStateAction<DashboardState>>
}>({dashboardState: defaultDashboardState, setDashboardState: () => {}});