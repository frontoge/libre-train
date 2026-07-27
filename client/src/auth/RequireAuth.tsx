import { useEffect, useState, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RequireAuth({ children }: { children: JSX.Element }) {
	const { isAuthenticated, auth } = useAuth();
	const locationObj = useLocation();
	const navigate = useNavigate();
	const [authenticated, setAuthenticated] = useState<boolean | undefined>(false);

	useEffect(() => {
		if (!isAuthenticated()) {
			navigate(`/login?redirect=${locationObj.pathname}`);
			return;
		}
		// Hard gate: a user signed in with a temporary password must replace it before
		// reaching any authenticated route.
		if (auth.mustChangePassword) {
			navigate('/set-password');
			return;
		}
		setAuthenticated(true);
	}, []);

	return <>{authenticated ? children : <></>}</>;
}
