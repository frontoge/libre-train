import type { AssessmentType, Exercise, ExerciseForm, ExerciseMovementPattern, MuscleGroup } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export type CreateExerciseRequest = {
	exercise_name: string;
	muscle_groups?: MuscleGroup[];
	exercise_description?: string;
	video_link?: string;
	equipment?: string;
	exercise_form: ExerciseForm;
	movement_pattern?: ExerciseMovementPattern;
	progression_level: number;
};

export type UpdateExerciseRequest = {
	exercise_name: string;
	muscle_groups: MuscleGroup[];
	exercise_description: string;
	video_link: string;
	equipment: string;
	exercise_form: ExerciseForm;
	movement_pattern?: ExerciseMovementPattern;
	progression_level: number;
};

export async function fetchExercises(): Promise<Exercise[]> {
	return apiFetch<Exercise[]>(Routes.Exercise, {
		method: 'GET',
		errorMessage: 'Failed to fetch exercises',
	});
}

export async function fetchAssessmentTypes(): Promise<AssessmentType[]> {
	return apiFetch<AssessmentType[]>(Routes.Assessment, {
		method: 'GET',
		errorMessage: 'Failed to fetch assessment types',
	});
}

export async function createExercise(data: CreateExerciseRequest): Promise<void> {
	await apiFetch<void, CreateExerciseRequest>(Routes.Exercise, {
		method: 'POST',
		body: data,
		errorMessage: 'Error creating exercise',
	});
}

export async function updateExercise(exerciseId: number, data: UpdateExerciseRequest): Promise<void> {
	await apiFetch<void, UpdateExerciseRequest>(`${Routes.Exercise}/${exerciseId}`, {
		method: 'PUT',
		body: data,
		errorMessage: 'Error updating exercise',
	});
}

export async function deleteExercise(exerciseId: number): Promise<void> {
	await apiFetch<void>(`${Routes.Exercise}/${exerciseId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete exercise',
	});
}
