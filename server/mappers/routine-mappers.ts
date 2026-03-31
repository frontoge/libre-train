import { PlannedExercise, PlannedExerciseGroup, WorkoutRoutine } from '@libre-train/shared';
import { WorkoutRoutineExerciseDTO } from '../types/dto';

type WorkoutRoutineWithIndices = Omit<WorkoutRoutine, 'exercise_groups'> & {
	exercise_groups: (Omit<PlannedExerciseGroup, 'exercises'> & {
		group_index: number;
		exercises: (PlannedExercise & { exercise_group_index: number })[];
	})[];
};

const nullToUndefined = <T>(value: T) => (value === null ? undefined : value);

export function mapWorkoutRoutineExerciseDTOToWorkoutRoutine(rows: WorkoutRoutineExerciseDTO[]): WorkoutRoutine[] {
	const routineMap = new Map<number, WorkoutRoutineWithIndices>();

	rows.forEach((row) => {
		let routine = routineMap.get(row.routineId);
		if (!routine) {
			routine = {
				id: row.routineId,
				microcycle_id: row.microcycle_id,
				routine_index: row.routine_index,
				routine_name: row.routine_name,
				isActive: row.isActive === 1,
				exercise_groups: [],
			};
			routineMap.set(row.routineId, routine);
		}

		if (row.group_index === null) {
			return;
		}

		let group = routine.exercise_groups[row.group_index];
		if (!group) {
			group = {
				rest_after: nullToUndefined(row.rest_after),
				rest_between: nullToUndefined(row.rest_between),
				group_index: row.group_index,
				routine_category: row.routine_category,
				exercises: [],
			};
			routine.exercise_groups.push(group);
			routine.exercise_groups.sort((a, b) => a.group_index - b.group_index);
		}

		group.exercises.push({
			exercise_id: row.exercise_id,
			exerciseName: row.exercise_name,
			exercise_group_index: row.exercise_group_index,
			repetitions: nullToUndefined(row.repetitions),
			sets: nullToUndefined(row.exercise_sets),
			weight: nullToUndefined(row.exercise_weight),
			duration: nullToUndefined(row.exercise_duration),
			distance: nullToUndefined(row.exercise_distance),
			target_heart_rate: nullToUndefined(row.target_heart_rate),
			pace: nullToUndefined(row.pace),
			rpe: nullToUndefined(row.rpe),
			target_calories: nullToUndefined(row.target_calories),
			target_mets: nullToUndefined(row.target_mets),
		});

		group.exercises.sort((a, b) => a.exercise_group_index - b.exercise_group_index);
	});

	return Array.from(routineMap.values()).map((routine) => ({
		...routine,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		exercise_groups: routine.exercise_groups.map(({ group_index, exercises, ...rest }) => ({
			...rest,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			exercises: exercises.map(({ exercise_group_index, ...ex }) => ex),
		})),
	}));
}
