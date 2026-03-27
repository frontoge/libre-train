import { Routes } from '@libre-train/shared';
import { jwtDecode } from 'jwt-decode';
import { useCallback, useContext } from 'react';
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
			return false;
		}
	};

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

		setAuth({ authToken: undefined, user: undefined });
		return false;
	}, [auth]);

	/**
	 * Method to refresh the user access token.
	 * @returns {boolean} Flag to indicate successful refresh of access token.
	 */
	const refreshAuthentication = async () => {
		try {
			const requestOptions = {
				method: 'POST',
				credentials: 'include' as RequestCredentials,
				headers: {
					'Content-Type': 'application/json',
				},
			};
			const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthRefresh}`, requestOptions);

			if (!response.ok) {
				setAuth({ authToken: undefined, user: undefined });
				return false;
			}

			const data = await response.json();
			setAuth({ authToken: data.accessToken, user: data.user });
			return true;
		} catch (error) {
			setAuth({ authToken: undefined, user: undefined });
			return false;
		}
	};

	return { auth, user: auth.user, isAuthenticated, refreshAuthentication, setAuth };
}
