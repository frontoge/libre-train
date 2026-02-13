import { BrowserRouter, Route, Routes } from "react-router-dom"
import { RouterLayout } from "./pages/Layout"
import { Dashboard } from "./pages/Dashboard"
import { NoPage } from "./pages/NoPage"
import { ConfigProvider, theme } from "antd"
import { ClientRouter } from "./pages/clients/ClientRouter"
import { AppContext, type AppState } from "./app-context"
import { useEffect, useState } from "react"
import { Signup } from "./pages/Signup"
import { jwtDecode } from "jwt-decode"
import type { Auth } from "./auth/authorization"
import { RequireAuth } from "./auth/RequireAuth"
import { Login } from "./pages/Login"
import { ExerciseRouter } from "./pages/exercises/ExerciseRouter"
import { PlanRouter } from "./pages/plans/PlanRouter"
import { getAppConfiguration } from "./config/app.config"
import { Routes as ApiRoutes } from "../../shared/routes";
import { AssessmentRouter } from "./pages/assessments/AssessmentRouter"

function App() {

	const [appState, setAppState] = useState<AppState>({
		clients: [],
		workoutRoutineStages: [],
		exerciseData: [],
		auth: {
			authToken: undefined,
			user: undefined
		}
	})

	const setAuth = (auth: Auth) => {
		setAppState(prevState => ({
			...prevState,
			auth
		}));
	}

	const isAuthenticated = () => {
		if (!appState.auth.authToken || appState.auth.user === undefined) {
			return false;
		}

		const decodedToken = jwtDecode(appState.auth.authToken);
		const currentDate = new Date();

		if (decodedToken === undefined || (decodedToken?.exp ?? 0) * 1000 < currentDate.getTime()) {
			return false;
		}

		return true;
	}

	const fetchWorkoutRoutineStages = async () => {
		try {
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
			const response = await fetch(`${getAppConfiguration().apiUrl}${ApiRoutes.WorkoutRoutineStages}`, requestOptions);
			const data = await response.json();
			setAppState(prevState => ({
				...prevState,
				workoutRoutineStages: data
			}));
		} catch (error) {
			console.error("Error fetching workout routine stages:", error);
		}
	};

	const fetchExercises = async () => {
		try {
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
			const response = await fetch(`${getAppConfiguration().apiUrl}${ApiRoutes.Exercise}`, requestOptions);
			const data = await response.json();
			setAppState(prevState => ({
				...prevState,
				exerciseData: data
			}));
		} catch (error) {
			console.error("Error fetching exercise data:", error);
		}
	}

	const fetchClients = async () => {
		try {
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
			const response = await fetch(`${getAppConfiguration().apiUrl}${ApiRoutes.ClientContact}`, requestOptions);
			const data = await response.json();
			setAppState( prev => ({...prev, clients: data}))
		} catch (error) {
			console.error("Error fetching client data:", error);
		}
	};

	const fetchAssessmentTypes = async () => {
		try {
			const requestOptions = {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
			const response = await fetch(`${getAppConfiguration().apiUrl}${ApiRoutes.Assessment}`, requestOptions);
			const data = await response.json();
			setAppState( prev => ({...prev, assessmentTypes: data}))
		} catch (error) {
			console.error("Error fetching assessment types:", error);
		}
	}

	const stateRefreshers = {
		refreshExerciseData: fetchExercises,
		refreshWorkoutRoutineStages: fetchWorkoutRoutineStages,
		refreshClients: fetchClients,
		refreshAssessmentTypes: fetchAssessmentTypes,
	}

	useEffect(() => {
		if (isAuthenticated() || getAppConfiguration().disableAuth) {
			fetchWorkoutRoutineStages();
			fetchExercises();
			fetchClients();
			fetchAssessmentTypes();
		}
	}, [])

  return (
	<AppContext value={{ state: appState, setState: setAppState, setAuth, isAuthenticated, stateRefreshers }}>

		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
				token: {
					colorPrimary: "#49aa19",
				},
				components: {
					Layout: {
						headerBg: '#141414ff'
					}
				}
			}}
		>
			<div style={{
				position: "absolute",
				height: "100%",
				width: "100%",
			}}>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<RouterLayout />} >
							<Route index element={<RequireAuth><Dashboard /></RequireAuth>} />
							<Route path="clients/*" element={<RequireAuth><ClientRouter /></RequireAuth>} />
							<Route path="exercises/*" element={<RequireAuth><ExerciseRouter /></RequireAuth>} />
							<Route path="plans/*" element={<RequireAuth><PlanRouter /></RequireAuth>} />
							<Route path="assessments/*" element={<RequireAuth><AssessmentRouter /></RequireAuth>} />
						</Route>
						<Route path="/signup" element={<Signup />} />
						<Route path="/login" element={<Login />} />
						<Route path="*" element={<NoPage />} />
					</Routes>
				</BrowserRouter>
			</div>
		</ConfigProvider>
	</AppContext>
  )
}

export default App
