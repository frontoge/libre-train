import React from "react";
import type { Client, RoutineExercise, WorkoutRoutine } from "../../../shared/types";
import type { TargetMetric } from "../../../shared/models";

export type NewPlanState = {
    clientOptions?: Client[];
    selectedClient?: number;

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