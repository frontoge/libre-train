import { PlannedExerciseGroupSchema, PlannedExerciseSchema, WorkoutRoutineSchema } from '@libre-train/db/zod';
import z from 'zod';

export const CreatePlannedExerciseSchema = PlannedExerciseSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
	exercise_group_id: true,
	exercise_group_index: true,
	exercise_distance: true,
}).extend({
	// Incoming JSON sends a plain number; Prisma.Decimal is only a DB concern
	exercise_distance: z.number().nullish(),
});

export const CreatePlannedExerciseGroupSchema = PlannedExerciseGroupSchema.omit({
	id: true,
	workout_routine_id: true,
	group_index: true,
}).extend({
	exercises: z.array(CreatePlannedExerciseSchema),
});

export const CreateWorkoutRoutineSchema = WorkoutRoutineSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
}).extend({
	exercise_groups: z.array(CreatePlannedExerciseGroupSchema),
});

export const UpdateWorkoutRoutineSchema = z.object({
	routine_name: WorkoutRoutineSchema.shape.routine_name,
	exercise_groups: z.array(CreatePlannedExerciseGroupSchema).optional(),
});

export const IdParamSchema = z.coerce.number().int().positive();
