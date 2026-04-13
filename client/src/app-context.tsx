import type { AssessmentType, ClientContact, Exercise } from '@libre-train/shared';
import React, { createContext } from 'react';
import type { Auth } from './auth/authorization';
import { getAppConfiguration } from './config/app.config';

export type AppState = {
	clients: ClientContact[];
	exerciseData?: Exercise[];
	assessmentTypes: AssessmentType[];
	showMessage: (
		type: 'success' | 'error' | 'info' | 'warning' | 'loading' | 'destroy',
		content: string,
		duration?: number
	) => void;
	auth: Auth;
};

export type StateRefreshers = {
	refreshExerciseData: () => void;
	refreshClients: () => void;
	refreshAssessmentTypes: () => void;
};

export type AppContext = {
	state: AppState;
	setState: React.Dispatch<React.SetStateAction<AppState>>;
	setAuth: (auth: Auth) => void;
	stateRefreshers?: StateRefreshers;
};

const initialContext: AppContext = {
	state: {
		assessmentTypes: [],
		clients: [],
		showMessage: () => {},
		auth: {
			authToken: '',
			user: import.meta.env.VITE_ENV === 'local' && getAppConfiguration().disableAuth ? 10 : undefined,
		},
	},
	setState: () => {},
	setAuth: () => {},
};

export const AppContext = createContext<AppContext>(initialContext);
