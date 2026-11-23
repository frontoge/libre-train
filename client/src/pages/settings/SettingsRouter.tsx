import { Navigate, Route, Routes } from 'react-router-dom';
import { RequirePermission } from '../../auth/RequirePermission';
import { usePermissions } from '../../hooks/usePermissions';
import { NoPage } from '../NoPage';
import { PermissionGroups } from '../permissions/PermissionGroups';
import { UserManagement } from '../users/UserManagement';
import { Customization } from './Customization';

// Land on the first settings page the user can actually open, so someone with (say) only user
// management rights isn't dropped onto a 403 for the default branding page.
function SettingsIndexRedirect() {
	const { can } = usePermissions();
	if (can('settings.branding')) return <Navigate to="customization" replace />;
	if (can('settings.users')) return <Navigate to="users" replace />;
	if (can('settings.permissions')) return <Navigate to="permissions" replace />;
	return <Navigate to="customization" replace />;
}

export function SettingsRouter() {
	return (
		<Routes>
			<Route index element={<SettingsIndexRedirect />} />
			<Route
				path="customization"
				element={
					<RequirePermission permission="settings.branding">
						<Customization />
					</RequirePermission>
				}
			/>
			<Route
				path="users"
				element={
					<RequirePermission permission="settings.users">
						<UserManagement />
					</RequirePermission>
				}
			/>
			<Route
				path="permissions"
				element={
					<RequirePermission permission="settings.permissions">
						<PermissionGroups />
					</RequirePermission>
				}
			/>
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
