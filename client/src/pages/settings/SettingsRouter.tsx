import { Navigate, Route, Routes } from 'react-router-dom';
import { NoPage } from '../NoPage';
import { Customization } from './Customization';

export function SettingsRouter() {
	return (
		<Routes>
			<Route index element={<Navigate to="customization" replace />} />
			<Route path="customization" element={<Customization />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
