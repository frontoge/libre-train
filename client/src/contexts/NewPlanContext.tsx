import React from "react";
import type { Client, WorkoutRoutine } from "../../../shared/types";
import type { TargetMetric } from "../../../shared/models";
import type { Dayjs } from "dayjs";

export type RangeValueType<T> = [T | null, T | null] | null;

export type NewPlanState = {
    clientOptions?: Client[];
    selectedClientId?: number;

    exerciseData: any[];
    refreshExercises: () => void;

    selectedDates?: [string, string];
    selectedDateRange?: RangeValueType<Dayjs>;
    existingPlans?: {
        planName: string;
        planId: number;
        stages: number;
    }[];
    targetMetricTypes?: TargetMetric[];
    selectedTargetMetricType?: TargetMetric;

    planName?: string;
    parentPlanId?: number;
    planStage?: number;
    planStagesCount?: number;
    targetMetricValue?: number;
    workoutRoutines: WorkoutRoutine[]
}

export type NewPlanContextType = {
    state: NewPlanState;
    updateState: (newState: Partial<NewPlanState>) => void;
}

export const defaultPlanState: NewPlanState = {
    refreshExercises: () => {},
    exerciseData: [],
    existingPlans: [],
    workoutRoutines: []
}

export const defaultNewPlanContextValue: NewPlanContextType = {
    state: defaultPlanState,
    updateState: (newState: Partial<NewPlanState>) => {}
};
    
export const NewPlanContext = React.createContext<NewPlanContextType>(defaultNewPlanContextValue);