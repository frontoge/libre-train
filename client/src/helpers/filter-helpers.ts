import stringSimilarity from "string-similarity-js";
import type { ExerciseSearchParams } from "../components/Exercises/ExerciseSearch";
import type { Exercise } from "../../../shared/models";


export const applyExerciseTableFilters = (exercises: Exercise[], filters: ExerciseSearchParams): Exercise[] => {
    return exercises.filter(exercise => {
        if (filters.name && stringSimilarity(exercise.exercise_name, filters.name) < 0.3) {
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
            const hasMuscleGroup = filters.muscleGroups.some(mg => exercise.muscle_groups.includes(mg));
            if (!hasMuscleGroup) {
                return false;
            } 
        }
        return true;
    });
}