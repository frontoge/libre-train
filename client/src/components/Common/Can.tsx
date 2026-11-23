import type { ReactNode } from 'react';
import { usePermissions, type PermissionRequirement } from '../../hooks/usePermissions';

type CanProps = {
	// A single permission key, or a list satisfied when the user holds ANY of them.
	permission: PermissionRequirement;
	children: ReactNode;
	// Rendered instead of children when the user lacks the permission (defaults to nothing).
	fallback?: ReactNode;
};

// Conditionally renders an action/section based on the signed-in user's permissions. Use this
// to gate in-page activities (buttons, menu actions) — e.g. <Can permission="clients.create">.
export function Can({ permission, children, fallback = null }: CanProps) {
	const { isAllowed } = usePermissions();
	return <>{isAllowed(permission) ? children : fallback}</>;
}
