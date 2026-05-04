import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';

export type LoginRequest = {
	username: string;
	password: string;
};

export type AuthResponse = {
	accessToken: string;
	user: number;
};

export async function loginUser(body: LoginRequest): Promise<AuthResponse> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthLogin}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Login failed');
	}

	return response.json() as Promise<AuthResponse>;
}

export async function signupUser(body: LoginRequest): Promise<AuthResponse> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthSignup}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || 'Signup failed');
	}

	return response.json() as Promise<AuthResponse>;
}

export async function refreshToken(): Promise<AuthResponse> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthRefresh}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error('Token refresh failed');
	}

	return response.json() as Promise<AuthResponse>;
}

export async function logoutUser(): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthLogout}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error('Logout failed');
	}
}
