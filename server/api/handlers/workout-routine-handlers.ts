import {
	CreateWorkoutRoutine,
	PlannedExercise,
	ResponseWithError,
	undefinedIfNull,
	UpdateWorkoutRoutineRequest,
	WorkoutRoutine,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import dayjs from '../../config/dayjs';
import { Prisma, prisma } from '../../database/mysql-database';
import { CreateWorkoutRoutineSchema, IdParamSchema, UpdateWorkoutRoutineSchema } from '../validators/workout-routine-validators';

type CreateWorkoutRoutineOptions = { shiftExistingIndices?: boolean };

export async function handleCreateWorkoutRoutine(req: Request<{}, {}, CreateWorkoutRoutine>, res: Response) {
	try {
		const workoutRoutineId = await createWorkoutRoutine(req.body);
		res.status(201).json({ workout_routine_id: workoutRoutineId });
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).json({ error: error.flatten() });
		} else if (error instanceof Error) {
			console.error('Error creating workout routine:', error.message);
			res.status(500).json({ error: 'Failed to create workout routine' });
		} else {
			console.error('Unknown error creating workout routine:', error);
			res.status(500).json({ error: 'An unknown error occurred while creating workout routine' });
		}
	}
}

export async function handleUpdateWorkoutRoutine(req: Request<{ id: string }, {}, UpdateWorkoutRoutineRequest>, res: Response) {
	try {
		const { id } = req.params;
		const { routine_name, exercise_groups } = UpdateWorkoutRoutineSchema.parse(req.body);
		const existingRoutine = await getWorkoutRoutineById(id);
		if (!existingRoutine) {
			res.status(404).json({ error: 'Workout routine not found' });
			return;
		}

		// delete existing routine
		await deleteWorkoutRoutine(id);

		// create new routine with updated data
		const newRoutine = await createWorkoutRoutine({
			...existingRoutine,
			routine_name: routine_name ?? existingRoutine.routine_name,
			exercise_groups: exercise_groups ?? existingRoutine.exercise_groups,
		} as unknown as CreateWorkoutRoutine);

		res.status(200).json({ workout_routine_id: newRoutine });
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).json({ error: error.flatten() });
		} else if (error instanceof Error) {
			console.error('Error updating workout routine:', error.message);
			res.status(500).json({ error: 'Failed to update workout routine' });
		} else {
			console.error('Unknown error updating workout routine:', error);
			res.status(500).json({ error: 'An unknown error occurred while updating workout routine' });
		}
	}
}

export async function handleDeleteWorkoutRoutine(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;
		await deleteWorkoutRoutine(id);
		res.status(200).json({ message: 'Workout routine deleted successfully' });
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).json({ error: error.flatten() });
		} else if (error instanceof Error) {
			console.error('Error deleting workout routine:', error.message);
			res.status(500).json({ error: 'Failed to delete workout routine' });
		} else {
			console.error('Unknown error deleting workout routine:', error);
			res.status(500).json({ error: 'An unknown error occurred while deleting workout routine' });
		}
	}
}

export async function handleGetCycleWorkoutRoutines(
	req: Request<{ microcycleId: string }>,
	res: Response<ResponseWithError<WorkoutRoutine[]>>
) {
	try {
		const parsedId = IdParamSchema.parse(req.params.microcycleId);

		const routines = await prisma.workoutRoutine.findMany({
			where: {
				Microcycle: { id: parsedId },
				isActive: true,
			},
			include: {
				PlannedExerciseGroup: {
					include: {
						PlannedExercise: true,
					},
				},
			},
		});

		if (!routines || routines.length === 0) {
			throw new Error('No workout routines found for the specified microcycle');
		}

		const workoutRoutines: WorkoutRoutine[] = routines
			.sort((a, b) => a.routine_index - b.routine_index)
			.map((routine) => ({
				id: routine.id,
				microcycle_id: routine.microcycle_id,
				routine_index: routine.routine_index,
				routine_name: undefinedIfNull(routine.routine_name),
				isActive: routine.isActive,
				created_at: dayjs.utc(routine.created_at).format('YYYY-MM-DD HH:mm:ss'),
				updated_at: dayjs.utc(routine.updated_at).format('YYYY-MM-DD HH:mm:ss'),
				exercise_groups: routine.PlannedExerciseGroup.sort((a, b) => a.group_index - b.group_index).map((group) => ({
					id: group.id,
					routine_category: group.routine_category,
					rest_between: undefinedIfNull(group.rest_between),
					rest_after: undefinedIfNull(group.rest_after),
					exercises: group.PlannedExercise.sort((a, b) => a.exercise_group_index - b.exercise_group_index).map(
						(ex): PlannedExercise => ({
							id: ex.id,
							exercise_id: ex.exercise_id,
							repetitions: undefinedIfNull(ex.repetitions),
							exercise_sets: undefinedIfNull(ex.exercise_sets),
							exercise_weight: undefinedIfNull(ex.exercise_weight),
							exercise_duration: undefinedIfNull(ex.exercise_duration),
							exercise_distance: undefinedIfNull(ex.exercise_distance?.toNumber()),
							target_heart_rate: undefinedIfNull(ex.target_heart_rate),
							pace: undefinedIfNull(ex.pace),
							rpe: undefinedIfNull(ex.rpe),
							target_calories: undefinedIfNull(ex.target_calories),
							target_mets: undefinedIfNull(ex.target_mets),
							created_at: dayjs.utc(ex.created_at).format('YYYY-MM-DD HH:mm:ss'),
							updated_at: dayjs.utc(ex.updated_at).format('YYYY-MM-DD HH:mm:ss'),
						})
					),
				})),
			}));

		res.status(200).json(workoutRoutines);
	} catch (error: unknown) {
		if (error instanceof ZodError) {
			res.status(400).json({ hasError: true, errorMessage: error.message });
		} else if (error instanceof Error) {
			console.error('Error fetching workout routines:', error.message);
			res.status(500).json({ hasError: true, errorMessage: 'Failed to fetch workout routines' });
		} else {
			console.error('Unknown error fetching workout routines:', error);
			res.status(500).json({ hasError: true, errorMessage: 'An unknown error occurred while fetching workout routines' });
		}
	}
}

async function deleteWorkoutRoutine(id: string) {
	const parsedId = IdParamSchema.parse(id);

	// Get the routine to find its microcycle_id and routine_index
	const routine = await prisma.workoutRoutine.findUnique({
		where: { id: parsedId },
	});

	if (!routine) {
		throw new Error('Workout routine not found');
	}

	// Deactivate this routine
	await prisma.workoutRoutine.update({
		where: { id: parsedId },
		data: { isActive: false },
	});

	// Decrement routine_index for all active routines with higher indices in the same microcycle
	await prisma.workoutRoutine.updateMany({
		where: {
			microcycle_id: routine.microcycle_id,
			routine_index: { gt: routine.routine_index },
			isActive: true,
		},
		data: {
			routine_index: {
				decrement: 1,
			},
		},
	});
}

async function getWorkoutRoutineById(id: string): Promise<WorkoutRoutine | undefined> {
	const parsedId = IdParamSchema.parse(id);

	const routine = await prisma.workoutRoutine.findUnique({
		where: { id: parsedId },
		include: {
			PlannedExerciseGroup: {
				include: {
					PlannedExercise: true,
				},
			},
		},
	});

	if (!routine) {
		return undefined;
	}

	const workoutRoutine: WorkoutRoutine = {
		id: routine.id,
		microcycle_id: routine.microcycle_id,
		routine_index: routine.routine_index,
		routine_name: undefinedIfNull(routine.routine_name),
		isActive: routine.isActive,
		exercise_groups: routine.PlannedExerciseGroup.map((group) => ({
			id: group.id,
			routine_category: group.routine_category,
			rest_between: undefinedIfNull(group.rest_between),
			rest_after: undefinedIfNull(group.rest_after),
			exercises: group.PlannedExercise.map(
				(ex): PlannedExercise => ({
					id: ex.id,
					exercise_id: ex.exercise_id,
					repetitions: undefinedIfNull(ex.repetitions),
					exercise_sets: undefinedIfNull(ex.exercise_sets),
					exercise_weight: undefinedIfNull(ex.exercise_weight),
					exercise_duration: undefinedIfNull(ex.exercise_duration),
					exercise_distance: undefinedIfNull(ex.exercise_distance?.toNumber()),
					target_heart_rate: undefinedIfNull(ex.target_heart_rate),
					pace: undefinedIfNull(ex.pace),
					rpe: undefinedIfNull(ex.rpe),
					target_calories: undefinedIfNull(ex.target_calories),
					target_mets: undefinedIfNull(ex.target_mets),
					created_at: dayjs.utc(ex.created_at).format('YYYY-MM-DD HH:mm:ss'),
					updated_at: dayjs.utc(ex.updated_at).format('YYYY-MM-DD HH:mm:ss'),
				})
			),
		})),
		created_at: dayjs.utc(routine.created_at).format('YYYY-MM-DD HH:mm:ss'),
		updated_at: dayjs.utc(routine.updated_at).format('YYYY-MM-DD HH:mm:ss'),
	};

	return workoutRoutine;
}

export async function createWorkoutRoutineTx(
	tx: Prisma.TransactionClient,
	routine: CreateWorkoutRoutine,
	options: CreateWorkoutRoutineOptions = {}
): Promise<number> {
	const { microcycle_id, routine_index, routine_name, isActive, exercise_groups } = CreateWorkoutRoutineSchema.parse(
		routine
	) as CreateWorkoutRoutine;

	const createdRoutine = await tx.workoutRoutine.create({
		data: {
			Microcycle: { connect: { id: microcycle_id } },
			routine_index,
			routine_name,
			isActive,
		},
	});

	const workoutRoutineId = createdRoutine.id;

	if (isActive && options.shiftExistingIndices) {
		await tx.workoutRoutine.updateMany({
			where: {
				Microcycle: { id: microcycle_id },
				routine_index: { gte: routine_index },
				id: { not: workoutRoutineId },
				isActive: true,
			},
			data: { routine_index: { increment: 1 } },
		});
	}

	// Serial per group to avoid deadlocks on the PlannedExerciseGroup (workout_routine_id, group_index)
	// unique index; the nested PlannedExercise.create collapses each group + its exercises into one query.
	for (let index = 0; index < exercise_groups.length; index++) {
		const { rest_between, rest_after, routine_category, exercises } = exercise_groups[index];

		await tx.plannedExerciseGroup.create({
			data: {
				workout_routine_id: workoutRoutineId,
				group_index: index,
				rest_between: rest_between ?? null,
				rest_after: rest_after ?? null,
				routine_category,
				PlannedExercise: {
					create: exercises.map((exercise, exIndex) => ({
						exercise_id: exercise.exercise_id,
						exercise_group_index: exIndex,
						repetitions: exercise.repetitions ?? null,
						exercise_sets: exercise.exercise_sets ?? null,
						exercise_weight: exercise.exercise_weight ?? null,
						exercise_duration: exercise.exercise_duration ?? null,
						exercise_distance: exercise.exercise_distance ?? null,
						target_heart_rate: exercise.target_heart_rate ?? null,
						pace: exercise.pace ?? null,
						rpe: exercise.rpe ?? null,
						target_calories: exercise.target_calories ?? null,
						target_mets: exercise.target_mets ?? null,
					})),
				},
			},
		});
	}

	return workoutRoutineId;
}

export async function createWorkoutRoutine(routine: CreateWorkoutRoutine): Promise<number | undefined> {
	try {
		return await prisma.$transaction((tx) => createWorkoutRoutineTx(tx, routine, { shiftExistingIndices: true }));
	} catch (error) {
		if (error instanceof ZodError) {
			throw error;
		}
		console.error('Error creating workout routine:', error);
		throw new Error('Failed to create workout routine');
	}
}

export async function deactivateCycleRoutines(
	cycleId: number,
	client: Prisma.TransactionClient = prisma
): Promise<void> {
	try {
		await client.workoutRoutine.updateMany({
			where: { Microcycle: { id: cycleId } },
			data: { isActive: false },
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error('Error deactivating workout routines:', error.message);
			throw new Error('Failed to deactivate workout routines');
		} else {
			console.error('Unknown error deactivating workout routines:', error);
			throw new Error('An unknown error occurred while deactivating workout routines');
		}
	}
}
