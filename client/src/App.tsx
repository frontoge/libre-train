import { BrowserRouter, Route, Routes } from "react-router-dom"
import { RouterLayout } from "./pages/Layout"
import { Dashboard } from "./pages/Dashboard"
import { NoPage } from "./pages/NoPage"
import { ConfigProvider, theme } from "antd"
import { ClientRouter } from "./pages/clients/ClientRouter"
import { AppContext, type AppState } from "./app-context"
import { useEffect, useState } from "react"
import { Signup } from "./pages/Signup"
import type { Auth } from "./auth/authorization"
import { RequireAuth } from "./auth/RequireAuth"
import { Login } from "./pages/Login"
import { ExerciseRouter } from "./pages/exercises/ExerciseRouter"
import { TrainingRouter } from "./pages/training/TrainingRouter"
import { getAppConfiguration } from "./config/app.config"
import { Routes as ApiRoutes } from "@libre-train/shared";
import { AssessmentRouter } from "./pages/assessments/AssessmentRouter"
import "./styles/app.css"
import { DietRouter } from "./pages/diet/DietRouter"
import { useAuth } from "./hooks/useAuth"
import { Logout } from "./pages/Logout"

function App() {
	const env = import.meta.env.VITE_ENV || 'local';
	const { isAuthenticated } = useAuth();

	const [appState, setAppState] = useState<AppState>({
		clients: [],
		assessmentTypes: [],
		exerciseData: [],
		auth: {
			authToken: undefined,
			user: (env === 'local' && getAppConfiguration().disableAuth) ? 10 : undefined
		}
	})

	const setAuth = (auth: Auth) => {
		if (env === 'local' && getAppConfiguration().disableAuth) {
			setAppState(prevState => ({
				...prevState,
				auth: {
					authToken: undefined,
					user: 10
				}	
			}))
			return;
		}

		setAppState(prevState => ({
			...prevState,
			auth
		}));
	}	

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
		refreshClients: fetchClients,
		refreshAssessmentTypes: fetchAssessmentTypes,
	}

	useEffect(() => {
		if (isAuthenticated()) {
			fetchExercises();
			fetchClients();
			fetchAssessmentTypes();
		}
	}, [appState.auth])

  return (
	<AppContext value={{ state: appState, setState: setAppState, setAuth, stateRefreshers }}>

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
							<Route path="training/*" element={<RequireAuth><TrainingRouter /></RequireAuth>} />
							<Route path="assessments/*" element={<RequireAuth><AssessmentRouter /></RequireAuth>} />
							<Route path="diet/*" element={<RequireAuth><DietRouter /></RequireAuth>} />
						</Route>
						<Route path="/signup" element={<Signup />} />
						<Route path="/login" element={<Login />} />
						<Route path="/logout" element={<Logout />} />
						<Route path="*" element={<NoPage />} />
					</Routes>
				</BrowserRouter>
			</div>
		</ConfigProvider>
	</AppContext>
  )
}

export default App
