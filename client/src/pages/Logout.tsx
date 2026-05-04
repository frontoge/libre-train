import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Logout() {
	const navigate = useNavigate();
	const { setAuth } = useAuth();

	const performLogout = async () => {
		try {
			await logoutUser();
			setAuth({ authToken: undefined, user: undefined });
			navigate('/login');
		} catch (error) {
			console.error('Error during logout:', error);
			navigate('/');
		}
	};

	useEffect(() => {
		performLogout();
	}, []);

	return <></>;
}
