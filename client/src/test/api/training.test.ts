import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	createMacrocycle,
	createMesocycle,
	createMicrocycle,
	deleteMacrocycle,
	deleteMesocycle,
	deleteMicrocycle,
	fetchChildMesocycles,
	fetchChildMicrocycles,
	fetchClientMacrocycles,
	fetchClientMesocycles,
	fetchClientMicrocycles,
	fetchMicrocycleById,
	fetchMicrocycleRoutines,
	updateMicrocycleRoutines,
} from '../../api/training';

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('training api', () => {
	describe('createMacrocycle', () => {
		it('posts macrocycle data and returns id', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ macrocycleId: 100 }) });

			const result = await createMacrocycle({
				cycle_name: 'Test Macro',
				client_id: 5,
				cycle_start_date: '2026-01-01',
				cycle_end_date: '2026-12-31',
				isActive: true,
			});

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/cycle/macro', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: expect.any(String),
			});
			expect(result).toBe(100);
		});

		it('returns undefined on error', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Error' });
			const result = await createMacrocycle({ cycle_name: 'X', client_id: 1, cycle_start_date: '', cycle_end_date: '', isActive: false });
			expect(result).toBeUndefined();
		});
	});

	describe('createMesocycle', () => {
		it('posts mesocycle data and returns id', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ mesocycleId: 200 }) });

			const result = await createMesocycle({
				cycle_name: 'Meso 1',
				cycle_start_date: '2026-01-01',
				cycle_end_date: '2026-03-31',
				is_active: true,
			});

			expect(result).toBe(200);
		});
	});

	describe('createMicrocycle', () => {
		it('posts microcycle data and returns id', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ microcycleId: 300 }) });

			const result = await createMicrocycle({
				cycle_name: 'Week 1',
				cycle_start_date: '2026-01-01',
				cycle_end_date: '2026-01-07',
				isActive: true,
			});

			expect(result).toBe(300);
		});
	});

	describe('fetchClientMacrocycles', () => {
		it('fetches macrocycles for client', async () => {
			const cycles = [{ id: 1, cycle_name: 'Macro 1' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => cycles });

			const result = await fetchClientMacrocycles(5);

			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api/cycle/macro/5',
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(cycles);
		});

		it('returns empty array on error', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Error' });
			const result = await fetchClientMacrocycles(99);
			expect(result).toEqual([]);
		});
	});

	describe('fetchClientMesocycles', () => {
		it('fetches mesocycles for client', async () => {
			const cycles = [{ id: 2, cycle_name: 'Meso 1' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => cycles });

			const result = await fetchClientMesocycles(5);

			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api/cycle/meso/5',
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(cycles);
		});
	});

	describe('fetchClientMicrocycles', () => {
		it('fetches microcycles with clientId param', async () => {
			const cycles = [{ id: 3, cycle_name: 'Week 1' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => cycles });

			const result = await fetchClientMicrocycles({ clientId: 5 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/cycle/micro'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(cycles);
		});
	});

	describe('fetchChildMesocycles', () => {
		it('fetches mesocycles for a macrocycle', async () => {
			const mesos = [{ id: 1, cycle_name: 'Child Meso' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => mesos });

			const result = await fetchChildMesocycles(10, 5);

			expect(result).toEqual(mesos);
		});
	});

	describe('fetchChildMicrocycles', () => {
		it('fetches microcycles for a mesocycle', async () => {
			const micros = [{ id: 1, cycle_name: 'Child Micro' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => micros });

			const result = await fetchChildMicrocycles(20, 5);

			expect(result).toEqual(micros);
		});
	});

	describe('fetchMicrocycleById', () => {
		it('fetches a microcycle by id', async () => {
			const micro = { id: 5, cycle_name: 'Week 3' };
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [micro] });

			const result = await fetchMicrocycleById(5);

			expect(mockFetch).toHaveBeenCalledWith(
				'http://test-api/cycle/micro/5',
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(micro);
		});

		it('returns undefined when array is empty', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
			const result = await fetchMicrocycleById(99);
			expect(result).toBeUndefined();
		});
	});

	describe('deleteMacrocycle', () => {
		it('sends DELETE request for macrocycle', async () => {
			const mockResponse = { ok: true };
			mockFetch.mockResolvedValueOnce(mockResponse);

			await deleteMacrocycle(1);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/cycle/macro/1', { method: 'DELETE' });
		});
	});

	describe('deleteMesocycle', () => {
		it('sends DELETE request for mesocycle', async () => {
			const mockResponse = { ok: true };
			mockFetch.mockResolvedValueOnce(mockResponse);

			await deleteMesocycle(2);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/cycle/meso/2', { method: 'DELETE' });
		});
	});

	describe('deleteMicrocycle', () => {
		it('sends DELETE request for microcycle', async () => {
			const mockResponse = { ok: true };
			mockFetch.mockResolvedValueOnce(mockResponse);

			await deleteMicrocycle(3);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/cycle/micro/3', { method: 'DELETE' });
		});
	});

	describe('fetchMicrocycleRoutines', () => {
		it('fetches routines for a microcycle', async () => {
			const routines = [{ id: 1, routine_name: 'Monday' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => routines });

			const result = await fetchMicrocycleRoutines(5);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/cycle/micro/5'),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(routines);
		});

		it('returns empty array on error', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Error' });
			const result = await fetchMicrocycleRoutines(99);
			expect(result).toEqual([]);
		});
	});

	describe('updateMicrocycleRoutines', () => {
		it('sends PUT request with routines data', async () => {
			const mockResponse = { ok: true };
			mockFetch.mockResolvedValueOnce(mockResponse);

			const routines = [{ routine_name: 'Push Day', exercise_groups: [] }];
			await updateMicrocycleRoutines(5, routines as any);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining('/cycle/micro/5'),
				expect.objectContaining({ method: 'PUT' })
			);
		});
	});
});
