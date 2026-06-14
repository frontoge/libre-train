import type { AssessmentType, BrandingResponse, ClientContact, ContactWithFlags, Exercise } from '@libre-train/shared';
import React, { createContext } from 'react';
import type { Auth } from './auth/authorization';
import { getAppConfiguration } from './config/app.config';

export const DEFAULT_BRAND_NAME = 'Libre Train';
// Default marketing copy for the public login / signup screens (used when branding is unset
// and as the target for the "reset to default" controls on the customization page).
export const DEFAULT_AUTH_TAGLINE = 'Coach smarter. Track better.';
export const DEFAULT_AUTH_DESCRIPTION =
	'Configure this area for your organization with logos, product messaging, release notes, or seasonal campaign content.';

export type AppState = {
	clients: ClientContact[];
	contacts: ContactWithFlags[];
	exerciseData?: Exercise[];
	assessmentTypes: AssessmentType[];
	branding: BrandingResponse;
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
	refreshContacts: () => void;
	refreshAssessmentTypes: () => void;
	refreshBranding: () => void;
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
		contacts: [],
		branding: { brand_name: DEFAULT_BRAND_NAME },
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
