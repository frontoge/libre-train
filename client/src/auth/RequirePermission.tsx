import { Button, Result, Spin } from 'antd';
import type { JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions, type PermissionRequirement } from '../hooks/usePermissions';
import { RequireAuth } from './RequireAuth';

function PermissionGate({ permission, children }: { permission: PermissionRequirement; children: JSX.Element }) {
	const { isAllowed, loaded } = usePermissions();
	const navigate = useNavigate();

	// Wait for permissions to resolve before deciding, so an allowed user never flashes a denial.
	if (!loaded) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
				<Spin size="large" />
			</div>
		);
	}

	if (!isAllowed(permission)) {
		return (
			<Result
				status="403"
				title="No access"
				subTitle="You don't have permission to view this page. Contact your admin if you need access."
				extra={
					<Button type="primary" onClick={() => navigate('/')}>
						Back to dashboard
					</Button>
				}
			/>
		);
	}

	return children;
}

// Route guard that requires authentication AND a permission. Composes RequireAuth so callers
// don't need to nest both. A string[] requirement is satisfied by holding ANY listed key.
export function RequirePermission({ permission, children }: { permission: PermissionRequirement; children: JSX.Element }) {
	return (
		<RequireAuth>
			<PermissionGate permission={permission}>{children}</PermissionGate>
		</RequireAuth>
	);
}
