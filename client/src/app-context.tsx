import { type Client } from "../../shared/types";
import React, { createContext } from "react";
import type { ModalType } from "./types/types";
import type { Auth } from "./auth/authorization";

export type AppState = {
    clients: Client[];
    selectedClient?: Client;
    selectedModal?: ModalType;
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

