import React from "react";
import type { Client } from "../../../shared/types";
import type { TargetMetric } from "../../../shared/models";

export type NewPlanState = {
    clientOptions?: Client[];
    selectedClient?: Client;

    exerciseData: any[];
    refreshExercises: () => void;

    selectedDates?: [string, string];
    existingPlans?: {
        planName: string;
        planId: number;
        stages: number;
    }[];
    targetMetricTypes?: TargetMetric[];
    selectedTargetMetricType?: TargetMetric;
}

export type NewPlanContextType = {
    state: NewPlanState;
    updateState: (newState: Partial<NewPlanState>) => void;
}

export const defaultNewPlanContextValue: NewPlanContextType = {
    state: {
        refreshExercises: () => {},
        exerciseData: [],
        existingPlans: []
    },
    updateState: (newState: Partial<NewPlanState>) => {}
};
    
export const NewPlanContext = React.createContext<NewPlanContextType>(defaultNewPlanContextValue);