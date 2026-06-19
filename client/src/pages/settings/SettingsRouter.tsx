import { Navigate, Route, Routes } from 'react-router-dom';
import { NoPage } from '../NoPage';
import { PermissionGroups } from '../permissions/PermissionGroups';
import { UserManagement } from '../users/UserManagement';
import { Customization } from './Customization';

export function SettingsRouter() {
	return (
		<Routes>
			<Route index element={<Navigate to="customization" replace />} />
			<Route path="customization" element={<Customization />} />
			<Route path="users" element={<UserManagement />} />
			<Route path="permissions" element={<PermissionGroups />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
