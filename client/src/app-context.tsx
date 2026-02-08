import React, { createContext } from "react";
import type { ModalType } from "./types/types";
import type { Auth } from "./auth/authorization";
import type { ClientContact, WorkoutRoutineStage } from "../../shared/models";
import type { ExerciseData } from "../../shared/MuscleGroups";

export type AppState = {
    clients: ClientContact[];
    selectedClient?: ClientContact;
    selectedModal?: ModalType;
    workoutRoutineStages: WorkoutRoutineStage[];
    exerciseData?: ExerciseData[];
    auth: Auth;
}

export type StateRefreshers = {
    refreshExerciseData: () => void;
    refreshClients: () => void;
    refreshWorkoutRoutineStages: () => void;
}

export type AppContext = {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    setAuth: (auth: Auth) => void;
    isAuthenticated: () => boolean;
    stateRefreshers?: StateRefreshers;
}

const initialContext: AppContext = {
    state: {
        selectedClient: undefined,
        clients: [],
        selectedModal: undefined,
        workoutRoutineStages: [],
        auth: {
            authToken: '',
            user: 0
        }
    },
    setState: () => {},
    setAuth: (auth: Auth) => { },
    isAuthenticated: () => false,
};

export const AppContext = createContext<AppContext>(initialContext);

