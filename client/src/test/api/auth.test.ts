import { afterEach, describe, expect, it, vi } from 'vitest';
import { loginUser, logoutUser, refreshToken, signupUser } from '../../api/auth';

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('auth api', () => {
	describe('loginUser', () => {
		it('posts credentials and returns auth response on success', async () => {
			const mockResponse = { accessToken: 'token123', user: 42 };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await loginUser({ username: 'testuser', password: 'secret' });

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ username: 'testuser', password: 'secret' }),
			});
			expect(result).toEqual(mockResponse);
		});

		it('throws an error when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ message: 'Invalid credentials' }),
			});

			await expect(loginUser({ username: 'bad', password: 'wrong' })).rejects.toThrow('Invalid credentials');
		});
	});

	describe('signupUser', () => {
		it('posts credentials and returns auth response on success', async () => {
			const mockResponse = { accessToken: 'token456', user: 99 };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await signupUser({ username: 'newuser', password: 'pass123' });

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ username: 'newuser', password: 'pass123' }),
			});
			expect(result).toEqual(mockResponse);
		});

		it('throws an error when signup fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ message: 'Username already exists' }),
			});

			await expect(signupUser({ username: 'existing', password: 'pass' })).rejects.toThrow('Username already exists');
		});
	});

	describe('refreshToken', () => {
		it('posts to refresh endpoint and returns auth response', async () => {
			const mockResponse = { accessToken: 'newToken', user: 42 };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await refreshToken();

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/auth/refresh', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			});
			expect(result).toEqual(mockResponse);
		});

		it('throws when refresh fails', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false });
			await expect(refreshToken()).rejects.toThrow('Token refresh failed');
		});
	});

	describe('logoutUser', () => {
		it('calls logout endpoint', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await logoutUser();

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/auth/logout', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			});
		});

		it('throws when logout fails', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false });
			await expect(logoutUser()).rejects.toThrow('Logout failed');
		});
	});
});
