import { afterEach, describe, expect, it, vi } from 'vitest';
import { createExercise, deleteExercise, fetchAssessmentTypes, fetchExercises, updateExercise } from '../../api/exercise';

// ExerciseForm enum values (mirrors @libre-train/shared)
const ExerciseForm = { Resistance: 7 } as const;

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('exercise api', () => {
	describe('fetchExercises', () => {
		it('fetches all exercises', async () => {
			const exercises = [{ id: 1, exercise_name: 'Squat' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => exercises });

			const result = await fetchExercises();

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/exercises', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			expect(result).toEqual(exercises);
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Server Error' });

			await expect(fetchExercises()).rejects.toThrow('Failed to fetch exercises');
		});
	});

	describe('fetchAssessmentTypes', () => {
		it('fetches all assessment types', async () => {
			const types = [{ id: 1, name: 'Body Weight' }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => types });

			const result = await fetchAssessmentTypes();

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/assessment', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			});
			expect(result).toEqual(types);
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Server Error' });

			await expect(fetchAssessmentTypes()).rejects.toThrow('Failed to fetch assessment types');
		});
	});

	describe('createExercise', () => {
		it('posts exercise data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = {
				exercise_name: 'Deadlift',
				exercise_form: ExerciseForm.Resistance,
				progression_level: 3,
			};

			await createExercise(data);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/exercises', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Validation Error' });

			await expect(
				createExercise({ exercise_name: 'Test', exercise_form: ExerciseForm.Resistance, progression_level: 1 })
			).rejects.toThrow('Error creating exercise');
		});
	});

	describe('updateExercise', () => {
		it('sends PUT request with exercise data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = {
				exercise_name: 'Updated Squat',
				muscle_groups: [],
				exercise_description: '',
				video_link: '',
				equipment: '',
				exercise_form: ExerciseForm.Resistance,
				progression_level: 4,
			};

			await updateExercise(5, data);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/exercises/5', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(
				updateExercise(99, {
					exercise_name: 'Test',
					muscle_groups: [],
					exercise_description: '',
					video_link: '',
					equipment: '',
					exercise_form: ExerciseForm.Resistance,
					progression_level: 1,
				})
			).rejects.toThrow('Error updating exercise');
		});
	});

	describe('deleteExercise', () => {
		it('sends DELETE request', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await deleteExercise(10);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/exercises/10', {
				method: 'DELETE',
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(deleteExercise(99)).rejects.toThrow('Failed to delete exercise');
		});
	});
});

