import { Route, Routes } from 'react-router-dom';
import { RequirePermission } from '../../auth/RequirePermission';
import { NoPage } from '../NoPage';
import { AddClient } from './AddClient';
import { ClientBrowser } from './ClientBrowser';
import { ClientDashboard } from './ClientDashboard';
import { ClientGoals } from './ClientGoals';

export function ClientRouter() {
	return (
		<Routes>
			<Route index element={<ClientDashboard />} />
			<Route path=":id" element={<ClientDashboard />} />
			<Route path=":id/goals" element={<ClientGoals />} />
			<Route
				path="create"
				element={
					<RequirePermission permission="clients.create">
						<AddClient />
					</RequirePermission>
				}
			/>
			<Route path="browse" element={<ClientBrowser />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
