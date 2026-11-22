/// <reference types="vite/client" />
import { ALL_PERMISSION_KEYS } from '@libre-train/shared';
import { ConfigProvider, message, theme } from 'antd';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppContext, DEFAULT_BRAND_NAME, type AppState, type ColorMode } from './app-context';
import type { Auth } from './auth/authorization';
import { RequireAuth } from './auth/RequireAuth';
import { RequirePermission } from './auth/RequirePermission';
import { getAppConfiguration } from './config/app.config';
import { AssessmentRouter } from './pages/assessments/AssessmentRouter';
import { ClientRouter } from './pages/clients/ClientRouter';
import { ContactsBrowser } from './pages/contacts/ContactsBrowser';
import { Dashboard } from './pages/Dashboard';
import { ExerciseRouter } from './pages/exercises/ExerciseRouter';
import { GoalsOverview } from './pages/goals/GoalsOverview';
import { RouterLayout } from './pages/Layout';
import { Login } from './pages/Login';
import { NoPage } from './pages/NoPage';
import { SetPassword } from './pages/SetPassword';
import { Signup } from './pages/Signup';
import { TrainingRouter } from './pages/training/TrainingRouter';
import './styles/app.css';
import { getBranding as apiGetBranding } from './api/branding';
import { fetchClientContacts as apiFetchClientContacts } from './api/client';
import { listContacts as apiListContacts } from './api/contacts';
import { fetchAssessmentTypes as apiFetchAssessmentTypes, fetchExercises as apiFetchExercises } from './api/exercise';
import { getMyPermissions as apiGetMyPermissions } from './api/users';
import { buildTheme, DEFAULT_BRANDING } from './config/themes';
import { ClientCycleRoutineView } from './pages/clients/ClientCycleRoutineView';
import { DietRouter } from './pages/diet/DietRouter';
import { Logout } from './pages/Logout';
import { SettingsRouter } from './pages/settings/SettingsRouter';

// Mirrors active theme tokens onto CSS variables so plain-CSS consumers (page base, list
// rows) follow light/dark mode instead of hardcoded colors.
function BackgroundSync() {
	const { token } = theme.useToken();
	useEffect(() => {
		const root = document.documentElement.style;
		root.setProperty('--app-bg', token.colorBgLayout);
		root.setProperty('--list-hover-bg', token.controlItemBgHover);
		root.setProperty('--list-selected-bg', token.controlItemBgActive);
	}, [token.colorBgLayout, token.controlItemBgHover, token.controlItemBgActive]);
	return null;
}

function App() {
	const env = import.meta.env.VITE_ENV || 'local';
	const [messageApi, contextHolder] = message.useMessage();

	// Light/dark UI preference, persisted across sessions.
	const [colorMode, setColorMode] = useState<ColorMode>(() =>
		localStorage.getItem('colorMode') === 'light' ? 'light' : 'dark'
	);
	const toggleColorMode = () =>
		setColorMode((prev) => {
			const next = prev === 'dark' ? 'light' : 'dark';
			localStorage.setItem('colorMode', next);
			return next;
		});

	const showMessage = (
		type: 'success' | 'error' | 'info' | 'warning' | 'loading' | 'destroy',
		content: string,
		duration?: number
	) => {
		if (type === 'destroy') {
			return messageApi.destroy();
		}
		return messageApi[type](content, duration);
	};

	const [appState, setAppState] = useState<AppState>({
		clients: [],
		contacts: [],
		assessmentTypes: [],
		exerciseData: [],
		branding: { brand_name: DEFAULT_BRAND_NAME },
		showMessage,
		auth: {
			authToken: undefined,
			user: env === 'local' && getAppConfiguration().disableAuth ? 10 : undefined,
		},
		permissions: [],
		permissionsLoaded: false,
	});

	const setAuth = (auth: Auth) => {
		if (env === 'local' && getAppConfiguration().disableAuth) {
			setAppState((prevState) => ({
				...prevState,
				auth: {
					authToken: undefined,
					user: 10,
				},
			}));
			return;
		}

		setAppState((prevState) => ({
			...prevState,
			auth,
			// A different user (or a sign-out) must not inherit the previous user's permissions.
			// Mark them unloaded so gates wait for the new fetch instead of using stale keys. A
			// token refresh for the same user keeps them, avoiding a spinner flash.
			...(prevState.auth.user !== auth.user ? { permissions: [], permissionsLoaded: false } : {}),
		}));
	};

	const fetchExercises = async () => {
		try {
			const data = await apiFetchExercises();
			setAppState((prevState) => ({
				...prevState,
				exerciseData: data,
			}));
		} catch (error) {
			console.error('Error fetching exercise data:', error);
		}
	};

	const fetchClients = async () => {
		try {
			const data = await apiFetchClientContacts();
			setAppState((prev) => ({ ...prev, clients: data }));
		} catch (error) {
			console.error('Error fetching client data:', error);
		}
	};

	const fetchContacts = async () => {
		try {
			const data = await apiListContacts();
			setAppState((prev) => ({ ...prev, contacts: data }));
		} catch (error) {
			console.error('Error fetching contact data:', error);
		}
	};

	const fetchAssessmentTypes = async () => {
		try {
			const data = await apiFetchAssessmentTypes();
			setAppState((prev) => ({ ...prev, assessmentTypes: data }));
		} catch (error) {
			console.error('Error fetching assessment types:', error);
		}
	};

	const fetchBranding = async () => {
		try {
			const data = await apiGetBranding();
			setAppState((prev) => ({ ...prev, branding: data }));
		} catch (error) {
			console.error('Error fetching branding:', error);
		}
	};

	const fetchPermissions = async () => {
		// Local auth bypass grants everything so dev work isn't blocked by the gate.
		if (env === 'local' && getAppConfiguration().disableAuth) {
			setAppState((prev) => ({ ...prev, permissions: ALL_PERMISSION_KEYS, permissionsLoaded: true }));
			return;
		}
		const { authToken, user } = appState.auth;
		if (!authToken) {
			setAppState((prev) => ({ ...prev, permissions: [], permissionsLoaded: true }));
			return;
		}
		// Ignore a response that lands after the user has changed (sign-out / switch account).
		const applyIfSameUser = (permissions: string[]) =>
			setAppState((prev) => (prev.auth.user === user ? { ...prev, permissions, permissionsLoaded: true } : prev));
		try {
			applyIfSameUser(await apiGetMyPermissions(authToken));
		} catch (error) {
			console.error('Error fetching permissions:', error);
			// Fail closed (no permissions) but mark loaded so gates resolve to a clean denial.
			applyIfSameUser([]);
		}
	};

	const stateRefreshers = {
		refreshExerciseData: fetchExercises,
		refreshClients: fetchClients,
		refreshContacts: fetchContacts,
		refreshAssessmentTypes: fetchAssessmentTypes,
		refreshBranding: fetchBranding,
		refreshPermissions: fetchPermissions,
	};

	useEffect(() => {
		if (appState.auth.user !== undefined) {
			fetchExercises();
			fetchClients();
			fetchContacts();
			fetchAssessmentTypes();
			fetchPermissions();
		}
	}, [appState.auth]);

	// Branding is public — load it on mount so colors/logo/title apply even on the login screen.
	useEffect(() => {
		fetchBranding();
	}, []);

	useEffect(() => {
		document.title = appState.branding.brand_name || DEFAULT_BRAND_NAME;
	}, [appState.branding.brand_name]);

	const appTheme = useMemo(
		() =>
			buildTheme(
				{
					primaryColor: appState.branding.primary_color,
					secondaryColor: appState.branding.secondary_color,
				},
				colorMode
			),
		[appState.branding.primary_color, appState.branding.secondary_color, colorMode]
	);

	const secondaryColor = appState.branding.secondary_color || DEFAULT_BRANDING.secondaryColor;

	return (
		<AppContext value={{ state: appState, setState: setAppState, setAuth, stateRefreshers, colorMode, toggleColorMode }}>
			<ConfigProvider theme={appTheme}>
				<div
					style={
						{
							'position': 'absolute',
							'height': '100%',
							'width': '100%',
							// Expose the secondary brand color for custom accents (CSS-only consumers).
							'--brand-secondary': secondaryColor,
						} as CSSProperties
					}
				>
					{contextHolder}
					<BackgroundSync />
					<Routes>
						<Route path="/clients/cycle/:microcycleId" element={<ClientCycleRoutineView />} />
						<Route path="/" element={<RouterLayout />}>
							<Route
								index
								element={
									<RequireAuth>
										<Dashboard />
									</RequireAuth>
								}
							/>
							<Route
								path="clients/*"
								element={
									<RequirePermission permission="clients.view">
										<ClientRouter />
									</RequirePermission>
								}
							/>
							<Route
								path="exercises/*"
								element={
									<RequirePermission permission="exercises.view">
										<ExerciseRouter />
									</RequirePermission>
								}
							/>
							<Route
								path="goals"
								element={
									<RequirePermission permission="clients.view">
										<GoalsOverview />
									</RequirePermission>
								}
							/>
							<Route
								path="training/*"
								element={
									<RequirePermission permission="training.view">
										<TrainingRouter />
									</RequirePermission>
								}
							/>
							<Route
								path="assessments/*"
								element={
									<RequirePermission permission="assessments.view">
										<AssessmentRouter />
									</RequirePermission>
								}
							/>
							<Route
								path="diet/*"
								element={
									<RequirePermission permission="nutrition.view">
										<DietRouter />
									</RequirePermission>
								}
							/>
							<Route
								path="contacts"
								element={
									<RequirePermission permission="contacts.view">
										<ContactsBrowser />
									</RequirePermission>
								}
							/>
							<Route
								path="settings/*"
								element={
									<RequirePermission
										permission={['settings.branding', 'settings.users', 'settings.permissions']}
									>
										<SettingsRouter />
									</RequirePermission>
								}
							/>
						</Route>
						<Route path="/signup" element={<Signup />} />
						<Route path="/login" element={<Login />} />
						<Route path="/set-password" element={<SetPassword />} />
						<Route path="/logout" element={<Logout />} />
						<Route path="*" element={<NoPage />} />
					</Routes>
				</div>
			</ConfigProvider>
		</AppContext>
	);
}

export default App;
