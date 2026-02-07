import React from "react";
import type { ExerciseData } from "../../../shared/MuscleGroups";

export type ExerciseContextType = {
    refreshExercises: () => void;
    exerciseData?: ExerciseData[];
}

export const defaultExerciseContextValue: ExerciseContextType = {
    refreshExercises: () => {},
    exerciseData: [],
};
    
export const ExerciseContext = React.createContext<ExerciseContextType>(defaultExerciseContextValue);