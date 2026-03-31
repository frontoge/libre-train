import { useEffect, useState, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RequireAuth({ children }: { children: JSX.Element }) {
	const { isAuthenticated } = useAuth();
	const locationObj = useLocation();
	const navigate = useNavigate();
	const [authenticated, setAuthenticated] = useState<boolean | undefined>(false);

	useEffect(() => {
		if (isAuthenticated()) {
			setAuthenticated(true);
		} else {
			navigate(`/login?redirect=${locationObj.pathname}`);
		}
	}, []);

	return <>{authenticated ? children : <></>}</>;
}
