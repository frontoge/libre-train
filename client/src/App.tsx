/// <reference types="vite/client" />
import { ConfigProvider, message } from 'antd';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppContext, DEFAULT_BRAND_NAME, type AppState } from './app-context';
import type { Auth } from './auth/authorization';
import { RequireAuth } from './auth/RequireAuth';
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
import { Signup } from './pages/Signup';
import { TrainingRouter } from './pages/training/TrainingRouter';
import './styles/app.css';
import { getBranding as apiGetBranding } from './api/branding';
import { fetchClientContacts as apiFetchClientContacts } from './api/client';
import { listContacts as apiListContacts } from './api/contacts';
import { fetchAssessmentTypes as apiFetchAssessmentTypes, fetchExercises as apiFetchExercises } from './api/exercise';
import { buildTheme, DEFAULT_BRANDING } from './config/themes';
import { ClientCycleRoutineView } from './pages/clients/ClientCycleRoutineView';
import { DietRouter } from './pages/diet/DietRouter';
import { Logout } from './pages/Logout';
import { SettingsRouter } from './pages/settings/SettingsRouter';

function App() {
	const env = import.meta.env.VITE_ENV || 'local';
	const [messageApi, contextHolder] = message.useMessage();

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

	const stateRefreshers = {
		refreshExerciseData: fetchExercises,
		refreshClients: fetchClients,
		refreshContacts: fetchContacts,
		refreshAssessmentTypes: fetchAssessmentTypes,
		refreshBranding: fetchBranding,
	};

	useEffect(() => {
		if (appState.auth.user !== undefined) {
			fetchExercises();
			fetchClients();
			fetchContacts();
			fetchAssessmentTypes();
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
			buildTheme({
				primaryColor: appState.branding.primary_color,
				secondaryColor: appState.branding.secondary_color,
			}),
		[appState.branding.primary_color, appState.branding.secondary_color]
	);

	const secondaryColor = appState.branding.secondary_color || DEFAULT_BRANDING.secondaryColor;

	return (
		<AppContext value={{ state: appState, setState: setAppState, setAuth, stateRefreshers }}>
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
									<RequireAuth>
										<ClientRouter />
									</RequireAuth>
								}
							/>
							<Route
								path="exercises/*"
								element={
									<RequireAuth>
										<ExerciseRouter />
									</RequireAuth>
								}
							/>
							<Route
								path="goals"
								element={
									<RequireAuth>
										<GoalsOverview />
									</RequireAuth>
								}
							/>
							<Route
								path="training/*"
								element={
									<RequireAuth>
										<TrainingRouter />
									</RequireAuth>
								}
							/>
							<Route
								path="assessments/*"
								element={
									<RequireAuth>
										<AssessmentRouter />
									</RequireAuth>
								}
							/>
							<Route
								path="diet/*"
								element={
									<RequireAuth>
										<DietRouter />
									</RequireAuth>
								}
							/>
							<Route
								path="contacts"
								element={
									<RequireAuth>
										<ContactsBrowser />
									</RequireAuth>
								}
							/>
							<Route
								path="settings/*"
								element={
									<RequireAuth>
										<SettingsRouter />
									</RequireAuth>
								}
							/>
						</Route>
						<Route path="/signup" element={<Signup />} />
						<Route path="/login" element={<Login />} />
						<Route path="/logout" element={<Logout />} />
						<Route path="*" element={<NoPage />} />
					</Routes>
				</div>
			</ConfigProvider>
		</AppContext>
	);
}

export default App;
