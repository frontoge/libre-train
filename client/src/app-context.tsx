import { type Client } from "../../shared/types";
import React, { createContext } from "react";
import type { ModalType } from "./types/types";
import type { Auth } from "./auth/authorization";
import type { WorkoutRoutineStage } from "../../shared/models";

export type AppState = {
    clients: Client[];
    selectedClient?: Client;
    selectedModal?: ModalType;
    workoutRoutineStages: WorkoutRoutineStage[];
    auth: Auth;
}

export type AppContext = {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    setAuth: (auth: Auth) => void;
    isAuthenticated: () => boolean;
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

