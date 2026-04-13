import type { Exercise } from '@libre-train/shared';
import { stringSimilarity } from 'string-similarity-js';
import type { ExerciseSearchParams } from '../components/Exercises/ExerciseSearch';

/**
 * Checks if two strings are similar based on a combination of substring checks and string similarity.
 * @param str1 The first string to compare.
 * @param str2 The second string to compare.
 * @param threshold The similarity threshold.
 * @returns True if the strings are similar, false otherwise.
 */
export const compareStrings = (str1: string, str2: string, threshold: number = 0.3): boolean => {
	const normalizedStr1 = str1.toLowerCase().trim();
	const normalizedStr2 = str2.toLowerCase().trim();

	return (
		normalizedStr1.includes(normalizedStr2)
		|| normalizedStr2.includes(normalizedStr1)
		|| stringSimilarity(normalizedStr1, normalizedStr2) > threshold
	);
};

export const applyExerciseTableFilters = (exercises: Exercise[], filters: ExerciseSearchParams): Exercise[] => {
	return exercises.filter((exercise) => {
		if (filters.name && !compareStrings(exercise.exercise_name, filters.name)) {
			return false;
		}
		if (filters.exerciseType && exercise.exercise_form !== filters.exerciseType) {
			return false;
		}
		if (filters.movementPattern && exercise.movement_pattern !== filters.movementPattern) {
			return false;
		}
		if (filters.progressionLevel && exercise.progression_level !== filters.progressionLevel) {
			return false;
		}
		if (filters.muscleGroups && filters.muscleGroups.length > 0) {
			const hasMuscleGroup = filters.muscleGroups.some((mg) => exercise.muscle_groups.includes(mg));
			if (!hasMuscleGroup) {
				return false;
			}
		}
		return true;
	});
};
