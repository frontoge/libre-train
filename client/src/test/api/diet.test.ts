import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createDietLogEntry,
	createDietPlan,
	deleteDietPlan,
	fetchClientDietPlan,
	fetchClientDietPlansForTrainer,
	fetchDietLogTodos,
	fetchDietPlanLogEntries,
	fetchTrainingPlanTodos,
} from '../../api/diet';

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('diet api', () => {
	describe('fetchClientDietPlan', () => {
		it('fetches diet plan for client', async () => {
			const plan = { id: 1, clientId: 5, planName: 'Plan A' };
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [plan] });

			const result = await fetchClientDietPlan(5);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/diet/plan'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(plan);
		});
	});

	describe('fetchClientDietPlansForTrainer', () => {
		it('fetches all client diet plans for a trainer', async () => {
			const plans = [{ clientId: 1, planName: 'Plan A' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => plans });

			const result = await fetchClientDietPlansForTrainer(10);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/diet/plan'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(plans);
		});
	});

	describe('fetchDietPlanLogEntries', () => {
		it('fetches diet log entries for a plan', async () => {
			const entries = [{ id: 1, logDate: '2026-01-01' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => entries });

			const result = await fetchDietPlanLogEntries(3);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/diet/log'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(entries);
		});
	});

	describe('fetchDietLogTodos', () => {
		it('fetches diet log todos for trainer', async () => {
			const todos = [{ clientId: 1, first_name: 'Alice' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => todos });

			const result = await fetchDietLogTodos(7);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/diet/log/todos'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(todos);
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(fetchDietLogTodos(1)).rejects.toThrow('Error fetching diet log todos');
		});
	});

	describe('fetchTrainingPlanTodos', () => {
		it('fetches training plan todos for trainer', async () => {
			const todos = [{ clientId: 2, first_name: 'Bob' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => todos });

			const result = await fetchTrainingPlanTodos(7);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/cycle/todos/no-active-plan'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(todos);
		});
	});

	describe('createDietPlan', () => {
		it('posts diet plan data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			const data = { clientId: 5, trainerId: 1, planName: 'New Plan' };
			await createDietPlan(data as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/diet/plan', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Bad Request' });

			await expect(createDietPlan({} as any)).rejects.toThrow('Failed to create diet plan');
		});
	});

	describe('deleteDietPlan', () => {
		it('sends DELETE request', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await deleteDietPlan(4);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/diet/plan/4', expect.objectContaining({ method: 'DELETE' }));
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(deleteDietPlan(99)).rejects.toThrow('Failed to delete diet plan');
		});
	});

	describe('createDietLogEntry', () => {
		it('posts diet log entry', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			const entry = { logDate: '2026-01-01', calories: 2000, protein: 150, carbs: 200, fats: 70 };
			await createDietLogEntry(entry as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/diet/log', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(entry),
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Bad Request' });

			await expect(createDietLogEntry({} as any)).rejects.toThrow('Failed to create diet log entry');
		});
	});
});
