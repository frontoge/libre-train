import { Route, Routes } from 'react-router-dom';
import { NoPage } from '../NoPage';
import { AddClient } from './AddClient';
import { ClientBrowser } from './ClientBrowser';
import { ClientDashboard } from './ClientDashboard';

export function ClientRouter() {
	return (
		<Routes>
			<Route index element={<ClientDashboard />} />
			<Route path=":id" element={<ClientDashboard />} />
			<Route path="create" element={<AddClient />} />
			<Route path="browse" element={<ClientBrowser />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
