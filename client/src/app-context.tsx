import { type Client } from "../../shared/types";
import React, { createContext } from "react";

export type AppState = {
    clients: Client[];
    selectedClient?: number;
}

export type AppContext = {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const initialContext: AppContext = {
    state: {
        selectedClient: undefined,
        clients: []
    },
    setState: () => {}
};

export const AppContext = createContext<AppContext>(initialContext);

