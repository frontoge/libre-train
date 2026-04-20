/// <reference types="vite/client" />
import { Routes as ApiRoutes } from '@libre-train/shared';
import { ConfigProvider, message } from 'antd';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppContext, type AppState } from './app-context';
import type { Auth } from './auth/authorization';
import { RequireAuth } from './auth/RequireAuth';
import { getAppConfiguration } from './config/app.config';
import { AssessmentRouter } from './pages/assessments/AssessmentRouter';
import { ClientRouter } from './pages/clients/ClientRouter';
import { Dashboard } from './pages/Dashboard';
import { ExerciseRouter } from './pages/exercises/ExerciseRouter';
import { GoalsOverview } from './pages/goals/GoalsOverview';
import { RouterLayout } from './pages/Layout';
import { Login } from './pages/Login';
import { NoPage } from './pages/NoPage';
import { Signup } from './pages/Signup';
import { TrainingRouter } from './pages/training/TrainingRouter';
import './styles/app.css';
import { darkTheme } from './config/themes';
import { ClientCycleRoutineView } from './pages/clients/ClientCycleRoutineView';
import { DietRouter } from './pages/diet/DietRouter';
import { Logout } from './pages/Logout';

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
		assessmentTypes: [],
		exerciseData: [],
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
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			};
			const response = await fetch(`${getAppConfiguration().apiUrl}${ApiRoutes.Exercise}`, requestOptions);
			const data = await response.json();
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
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			};
			const response = await fetch(`${getAppConfiguration().apiUrl}${ApiRoutes.ClientContact}`, requestOptions);
			const data = await response.json();
			setAppState((prev) => ({ ...prev, clients: data }));
		} catch (error) {
			console.error('Error fetching client data:', error);
		}
	};

	const fetchAssessmentTypes = async () => {
		try {
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			};
			const response = await fetch(`${getAppConfiguration().apiUrl}${ApiRoutes.Assessment}`, requestOptions);
			const data = await response.json();
			setAppState((prev) => ({ ...prev, assessmentTypes: data }));
		} catch (error) {
			console.error('Error fetching assessment types:', error);
		}
	};

	const stateRefreshers = {
		refreshExerciseData: fetchExercises,
		refreshClients: fetchClients,
		refreshAssessmentTypes: fetchAssessmentTypes,
	};

	useEffect(() => {
		if (appState.auth.user !== undefined) {
			fetchExercises();
			fetchClients();
			fetchAssessmentTypes();
		}
	}, [appState.auth]);

	return (
		<AppContext value={{ state: appState, setState: setAppState, setAuth, stateRefreshers }}>
			<ConfigProvider theme={darkTheme}>
				<div
					style={{
						position: 'absolute',
						height: '100%',
						width: '100%',
					}}
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
