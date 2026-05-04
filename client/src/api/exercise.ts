import type { AssessmentType, Exercise, ExerciseForm, ExerciseMovementPattern, MuscleGroup } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';

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
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch exercises: ${response.statusText}`);
	}

	return response.json() as Promise<Exercise[]>;
}

export async function fetchAssessmentTypes(): Promise<AssessmentType[]> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Assessment}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch assessment types: ${response.statusText}`);
	}

	return response.json() as Promise<AssessmentType[]>;
}

export async function createExercise(data: CreateExerciseRequest): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Error creating exercise: ${response.statusText}`);
	}
}

export async function updateExercise(exerciseId: number, data: UpdateExerciseRequest): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}/${exerciseId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Error updating exercise: ${response.statusText}`);
	}
}

export async function deleteExercise(exerciseId: number): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}/${exerciseId}`, {
		method: 'DELETE',
	});

	if (!response.ok) {
		throw new Error(`Failed to delete exercise: ${response.statusText}`);
	}
}
