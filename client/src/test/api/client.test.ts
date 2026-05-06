import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createClient,
	deleteClient,
	fetchClientContacts,
	fetchClientDashboardData,
	fetchClientWeeklySummary,
	submitClientDailyUpdate,
	updateClient,
	updateContact,
} from '../../api/client';

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('client api', () => {
	describe('createClient', () => {
		it('posts new client data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', trainerId: 1 };

			await createClient(data as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});

		it('throws when the response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ errorMessage: 'Validation failed' }),
			});

			await expect(createClient({} as any)).rejects.toThrow('Validation failed');
		});
	});

	describe('updateClient', () => {
		it('sends PUT request with client data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = { notes: 'Updated notes' };

			await updateClient(5, data as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/clients/5', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ errorMessage: 'Not found' }),
			});

			await expect(updateClient(99, {} as any)).rejects.toThrow('Not found');
		});
	});

	describe('deleteClient', () => {
		it('sends DELETE request and returns true on success', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			const result = await deleteClient(3);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/clients/3', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
			});
			expect(result).toBe(true);
		});

		it('returns false on failure', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ errorMessage: 'Cannot delete' }),
			});

			const result = await deleteClient(999);
			expect(result).toBe(false);
		});
	});

	describe('fetchClientContacts', () => {
		it('fetches all contacts when no clientId provided', async () => {
			const contacts = [{ ClientId: 1, first_name: 'John' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => contacts });

			const result = await fetchClientContacts();

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/clientcontact/', expect.objectContaining({ method: 'GET' }));
			expect(result).toEqual(contacts);
		});

		it('fetches contacts for a specific clientId', async () => {
			const contacts = [{ ClientId: 7, first_name: 'Jane' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => contacts });

			const result = await fetchClientContacts(7);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/clientcontact/7', expect.objectContaining({ method: 'GET' }));
			expect(result).toEqual(contacts);
		});
	});

	describe('updateContact', () => {
		it('sends PUT request for contact update', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = { email: 'new@example.com' };

			await updateContact(10, data as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/contact/10', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});
	});

	describe('fetchClientDashboardData', () => {
		it('fetches dashboard data with search params', async () => {
			const dashboardData = { logged_weight: 75 };
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => dashboardData });

			const result = await fetchClientDashboardData({ clientId: '5', date: '2026-01-01' });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/clients/dashboard'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(dashboardData);
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(fetchClientDashboardData({ clientId: '1', date: '2026-01-01' })).rejects.toThrow(
				'Failed to fetch client dashboard data'
			);
		});
	});

	describe('fetchClientWeeklySummary', () => {
		it('fetches weekly summary data', async () => {
			const summaryData = [{ avg_weight: 75 }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => summaryData });

			const result = await fetchClientWeeklySummary({ clientId: '5', startDate: '2026-01-01', endDate: '2026-01-07' });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('dashboard/summary'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(summaryData);
		});

		it('throws if data contains a message property', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ message: 'No data found' }),
			});

			await expect(
				fetchClientWeeklySummary({ clientId: '5', startDate: '2026-01-01', endDate: '2026-01-07' })
			).rejects.toThrow('No data found');
		});
	});

	describe('submitClientDailyUpdate', () => {
		it('posts daily update data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = { clientId: 5, date: '2026-01-01', data: { weight: 75 } };

			await submitClientDailyUpdate(data as any);

			expect(mockFetch).toHaveBeenCalledWith(
				`http://test-api/clients/daily-update`,
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(data),
				})
			);
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false });

			await expect(submitClientDailyUpdate({} as any)).rejects.toThrow('Failed to submit daily update');
		});
	});
});
