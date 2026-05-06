import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export type LoginRequest = {
	username: string;
	password: string;
};

export type AuthResponse = {
	accessToken: string;
	user: number;
};

export async function loginUser(body: LoginRequest): Promise<AuthResponse> {
	return apiFetch<AuthResponse, LoginRequest>(Routes.AuthLogin, {
		method: 'POST',
		body,
		credentials: 'include',
		errorMessage: 'Login failed',
	});
}

export async function signupUser(body: LoginRequest): Promise<AuthResponse> {
	return apiFetch<AuthResponse, LoginRequest>(Routes.AuthSignup, {
		method: 'POST',
		body,
		credentials: 'include',
		errorMessage: 'Signup failed',
	});
}

export async function refreshToken(): Promise<AuthResponse> {
	return apiFetch<AuthResponse>(Routes.AuthRefresh, {
		method: 'POST',
		credentials: 'include',
		errorMessage: 'Token refresh failed',
	});
}

export async function logoutUser(): Promise<void> {
	await apiFetch<void>(Routes.AuthLogout, {
		method: 'GET',
		credentials: 'include',
		errorMessage: 'Logout failed',
	});
}
