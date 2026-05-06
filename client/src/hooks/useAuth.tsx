import { jwtDecode } from 'jwt-decode';
import { useCallback, useContext } from 'react';
import { refreshToken } from '../api/auth';
import { AppContext } from '../app-context';
import { getAppConfiguration } from '../config/app.config';

export function useAuth() {
	const {
		state: { auth },
		setAuth,
	} = useContext(AppContext);

	const isValidToken = (token: string | undefined): boolean => {
		if (!token) {
			return false;
		}
		try {
			const decodedToken = jwtDecode(token);
			const currentTime = Date.now();
			return (decodedToken?.exp ?? 0) * 1000 >= currentTime;
		} catch (error) {
			console.error('Error decoding token:', error);
			return false;
		}
	};

	const clearAuth = useCallback(() => {
		if (auth.authToken === undefined && auth.user === undefined) {
			return;
		}

		setAuth({ authToken: undefined, user: undefined });
	}, [auth.authToken, auth.user, setAuth]);

	/**
	 *
	 * @returns {boolean} True or false if the user is currently authenticated
	 */
	const isAuthenticated = useCallback(() => {
		const env = import.meta.env.VITE_ENV || 'local';
		if (env === 'local' && getAppConfiguration().disableAuth) {
			return true;
		}

		if (isValidToken(auth.authToken) && auth.user !== undefined) {
			return true;
		}

		clearAuth();
		return false;
	}, [auth.authToken, auth.user, clearAuth]);

	/**
	 * Method to refresh the user access token.
	 * @returns {boolean} Flag to indicate successful refresh of access token.
	 */
	const refreshAuthentication = useCallback(async () => {
		try {
			const data = await refreshToken();
			setAuth({ authToken: data.accessToken, user: data.user });
			return true;
		} catch (error) {
			console.error('Error refreshing authentication:', error);
			clearAuth();
			return false;
		}
	}, [clearAuth, setAuth]);

	return { auth, user: auth.user, isAuthenticated, refreshAuthentication, setAuth };
}
