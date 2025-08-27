import { type Client } from "../../shared/types";
import React, { createContext } from "react";
import type { ModalType } from "./types/types";

export type AppState = {
    clients: Client[];
    selectedClient?: Client;
    selectedModal?: ModalType;
}

export type AppContext = {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const initialContext: AppContext = {
    state: {
        selectedClient: undefined,
        clients: [],
        selectedModal: undefined
    },
    setState: () => {}
};

export const AppContext = createContext<AppContext>(initialContext);

