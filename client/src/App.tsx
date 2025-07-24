import { BrowserRouter, Route, Routes } from "react-router-dom"
import { RouterLayout } from "./pages/Layout"
import { Dashboard } from "./pages/Dashboard"
import { NoPage } from "./pages/NoPage"
import { ConfigProvider, theme } from "antd"
import { ClientRouter } from "./pages/clients/ClientRouter"

function App() {
  return (
	<ConfigProvider
		theme={{
			algorithm: theme.darkAlgorithm,
			token: {
				colorPrimary: "#49aa19",
			},
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
						<Route index element={<Dashboard />} />
						<Route path="clients/*" element={<ClientRouter />} />
						<Route path="*" element={<NoPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</div>
	</ConfigProvider>
  )
}

export default App
