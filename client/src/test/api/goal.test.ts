import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createClientGoal,
	deleteClientGoal,
	fetchClientGoals,
	fetchGoalById,
	fetchTrainerGoals,
	updateClientGoal,
} from '../../api/goal';

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('goal api', () => {
	describe('fetchClientGoals', () => {
		it('fetches goals for a client', async () => {
			const goals = [{ id: 1, description: 'Lose 10kg' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => goals });

			const result = await fetchClientGoals(5);

			expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/goal'), expect.objectContaining({ method: 'GET' }));
			expect(result).toEqual(goals);
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(fetchClientGoals(99)).rejects.toThrow('Failed to fetch client goals');
		});

		it('throws when data contains hasError', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ hasError: true, errorMessage: 'Client not found' }),
			});

			await expect(fetchClientGoals(99)).rejects.toThrow('Client not found');
		});
	});

	describe('fetchTrainerGoals', () => {
		it('fetches all goals for a trainer', async () => {
			const goals = [{ id: 2, description: 'Run 5K' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => goals });

			const result = await fetchTrainerGoals(1);

			expect(result).toEqual(goals);
		});
	});

	describe('fetchGoalById', () => {
		it('fetches a specific goal by id', async () => {
			const goal = { id: 3, description: 'Bench 100kg' };
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => goal });

			const result = await fetchGoalById(3);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/goal/3', expect.objectContaining({ method: 'GET' }));
			expect(result).toEqual(goal);
		});

		it('throws when goal is not found', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(fetchGoalById(999)).rejects.toThrow('Failed to fetch goal');
		});
	});

	describe('createClientGoal', () => {
		it('posts goal data and returns id', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ goalId: 42 }) });

			const result = await createClientGoal({ clientId: 5, description: 'New Goal' } as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/goal', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: expect.any(String),
			});
			expect(result).toBe(42);
		});

		it('throws when creation fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: 'Validation error' }),
			});

			await expect(createClientGoal({} as any)).rejects.toThrow('Validation error');
		});
	});

	describe('updateClientGoal', () => {
		it('sends PUT request to update goal', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await updateClientGoal(5, { description: 'Updated goal' } as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/goal/5', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: expect.any(String),
			});
		});

		it('throws when update fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: 'Not found' }),
			});

			await expect(updateClientGoal(99, {} as any)).rejects.toThrow('Not found');
		});
	});

	describe('deleteClientGoal', () => {
		it('sends DELETE request', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await deleteClientGoal(7);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/goal/7', expect.objectContaining({ method: 'DELETE' }));
		});

		it('throws when deletion fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				json: async () => ({ error: 'Cannot delete' }),
			});

			await expect(deleteClientGoal(99)).rejects.toThrow('Cannot delete');
		});
	});
});
