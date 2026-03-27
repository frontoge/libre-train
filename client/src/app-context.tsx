import React, { createContext } from "react";
import type { ModalType } from "./types/types";
import type { Auth } from "./auth/authorization";
import type { AssessmentType, ClientContact, Exercise } from "@libre-train/shared";
import { getAppConfiguration } from "./config/app.config";

export type AppState = {
    clients: ClientContact[];
    selectedClient?: ClientContact;
    selectedModal?: ModalType;
    exerciseData?: Exercise[];
    assessmentTypes: AssessmentType[];
    auth: Auth;
}

export type StateRefreshers = {
    refreshExerciseData: () => void;
    refreshClients: () => void;
    refreshAssessmentTypes: () => void;
}

export type AppContext = {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    setAuth: (auth: Auth) => void;
    stateRefreshers?: StateRefreshers;
}

const initialContext: AppContext = {
    state: {
        selectedClient: undefined,
        assessmentTypes: [],
        clients: [],
        selectedModal: undefined,
        auth: {
            authToken: '',
            user: (import.meta.env.VITE_ENV === 'local' && getAppConfiguration().disableAuth) ? 10 : undefined
        }
    },
    setState: () => {},
    setAuth: (auth: Auth) => { },
};

export const AppContext = createContext<AppContext>(initialContext);

