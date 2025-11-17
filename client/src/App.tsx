import { BrowserRouter, Route, Routes } from "react-router-dom"
import { RouterLayout } from "./pages/Layout"
import { Dashboard } from "./pages/Dashboard"
import { NoPage } from "./pages/NoPage"
import { ConfigProvider, theme } from "antd"
import { ClientRouter } from "./pages/clients/ClientRouter"
import { AppContext, type AppState } from "./app-context"
import { useState } from "react"
import { Signup } from "./pages/Signup"
import { jwtDecode } from "jwt-decode"
import type { Auth } from "./auth/authorization"
import { RequireAuth } from "./auth/RequireAuth"
import { Login } from "./pages/Login"

function App() {

	const [appState, setAppState] = useState<AppState>({
		clients: [],
		auth: {
			authToken: '',
			user: 0
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

  return (
	<AppContext value={{ state: appState, setState: setAppState, setAuth, isAuthenticated }}>

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
