import {
	PlannedExercise,
	PlannedExerciseGroup,
	ResponseWithError,
	UpdateWorkoutRoutineRequest,
	WorkoutRoutine,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import { prisma } from '../../database/mysql-database';

export async function handleCreateWorkoutRoutine(req: Request<{}, {}, Omit<WorkoutRoutine, 'id'>>, res: Response) {
	try {
		const workoutRoutineId = await createWorkoutRoutine(req.body);
		res.status(201).json({ workout_routine_id: workoutRoutineId });
	} catch (error: Error | unknown) {
		if (error instanceof Error) {
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
		const { routine_name, exercise_groups } = req.body;
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
		});

		res.status(200).json({ workout_routine_id: newRoutine });
	} catch (error: Error | unknown) {
		if (error instanceof Error) {
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
	} catch (error: Error | unknown) {
		if (error instanceof Error) {
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
		const { microcycleId } = req.params;
		const parsedId = parseInt(microcycleId, 10);

		const routines = await prisma.workoutRoutine.findMany({
			where: {
				microcycle_id: parsedId,
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

		const workoutRoutines: WorkoutRoutine[] = routines.map((routine) => ({
			id: routine.id,
			microcycle_id: routine.microcycle_id,
			routine_index: routine.routine_index,
			routine_name: routine.routine_name,
			isActive: routine.isActive,
			exercise_groups: routine.PlannedExerciseGroup.map((group) => ({
				routine_category: group.routine_category,
				rest_between: group.rest_between,
				rest_after: group.rest_after,
				exercises: group.PlannedExercise.map((ex) => ({
					exercise_id: ex.exercise_id,
					repetitions: ex.repetitions,
					sets: ex.exercise_sets,
					weight: ex.exercise_weight,
					duration: ex.exercise_duration,
					distance: ex.exercise_distance,
					target_heart_rate: ex.target_heart_rate,
					pace: ex.pace,
					rpe: ex.rpe,
					target_calories: ex.target_calories,
					target_mets: ex.target_mets,
				})),
			})),
		}));

		res.status(200).json(workoutRoutines);
	} catch (error: Error | unknown) {
		if (error instanceof Error) {
			console.error('Error fetching workout routines:', error.message);
			res.status(500).json({ hasError: true, errorMessage: 'Failed to fetch workout routines' });
		} else {
			console.error('Unknown error fetching workout routines:', error);
			res.status(500).json({ hasError: true, errorMessage: 'An unknown error occurred while fetching workout routines' });
		}
	}
}

async function deleteWorkoutRoutine(id: string) {
	const parsedId = parseInt(id, 10);

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
	const parsedId = parseInt(id, 10);

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

	return {
		id: routine.id,
		microcycle_id: routine.microcycle_id,
		routine_index: routine.routine_index,
		routine_name: routine.routine_name,
		isActive: routine.isActive,
		exercise_groups: routine.PlannedExerciseGroup.map((group) => ({
			routine_category: group.routine_category,
			rest_between: group.rest_between,
			rest_after: group.rest_after,
			exercises: group.PlannedExercise.map((ex) => ({
				exercise_id: ex.exercise_id,
				repetitions: ex.repetitions,
				sets: ex.exercise_sets,
				weight: ex.exercise_weight,
				duration: ex.exercise_duration,
				distance: ex.exercise_distance,
				target_heart_rate: ex.target_heart_rate,
				pace: ex.pace,
				rpe: ex.rpe,
				target_calories: ex.target_calories,
				target_mets: ex.target_mets,
			})),
		})),
	};
}

export async function createWorkoutRoutine(routine: Omit<WorkoutRoutine, 'id'>): Promise<number | undefined> {
	try {
		const { microcycle_id, routine_index, routine_name, isActive, exercise_groups } = routine;

		// Create the workout routine
		const createdRoutine = await prisma.workoutRoutine.create({
			data: {
				microcycle_id,
				routine_index,
				routine_name,
				isActive: isActive,
			},
		});

		const workoutRoutineId = createdRoutine.id;

		// If this is active, increment indices of other routines with same or higher index
		if (isActive) {
			await prisma.workoutRoutine.updateMany({
				where: {
					microcycle_id,
					routine_index: { gte: routine_index },
					id: { not: workoutRoutineId },
					isActive: true,
				},
				data: {
					routine_index: {
						increment: 1,
					},
				},
			});
		}

		// Create the exercise groups for the routine
		await Promise.all(
			exercise_groups.map(async (group: PlannedExerciseGroup, index: number) => {
				const { rest_between, rest_after, routine_category, exercises } = group;

				const createdGroup = await prisma.plannedExerciseGroup.create({
					data: {
						workout_routine_id: workoutRoutineId,
						group_index: index,
						rest_between: rest_between ?? null,
						rest_after: rest_after ?? null,
						routine_category,
					},
				});

				const groupId = createdGroup.id;

				// Increment group indices for existing groups with same or higher index
				await prisma.plannedExerciseGroup.updateMany({
					where: {
						workout_routine_id: workoutRoutineId,
						group_index: { gte: index },
						id: { not: groupId },
					},
					data: {
						group_index: {
							increment: 1,
						},
					},
				});

				// Create the exercises for the group
				await Promise.all(
					exercises.map(async (exercise: PlannedExercise, exIndex: number) => {
						const {
							exercise_id,
							repetitions,
							sets,
							weight,
							duration,
							distance,
							target_heart_rate,
							pace,
							rpe,
							target_calories,
							target_mets,
						} = exercise;

						const createdExercise = await prisma.plannedExercise.create({
							data: {
								exercise_id,
								planned_exercise_group_id: groupId,
								exercise_index: exIndex,
								repetitions: repetitions ?? null,
								sets: sets ?? null,
								weight: weight ?? null,
								duration: duration ?? null,
								distance: distance ?? null,
								target_heart_rate: target_heart_rate ?? null,
								pace: pace ?? null,
								rpe: rpe ?? null,
								target_calories: target_calories ?? null,
								target_mets: target_mets ?? null,
							},
						});

						// Increment exercise indices for existing exercises with same or higher index
						await prisma.plannedExercise.updateMany({
							where: {
								planned_exercise_group_id: groupId,
								exercise_index: { gte: exIndex },
								id: { not: createdExercise.id },
							},
							data: {
								exercise_index: {
									increment: 1,
								},
							},
						});
					})
				);
			})
		);

		return workoutRoutineId;
		return workoutRoutineId;
	} catch (error) {
		console.error('Error creating workout routine:', error);
		throw new Error('Failed to create workout routine');
	}
}

export async function deactivateCycleRoutines(cycleId: number): Promise<void> {
	try {
		await prisma.workoutRoutine.updateMany({
			where: { microcycle_id: cycleId },
			data: { is_active: false },
		});
	} catch (error: Error | unknown) {
		if (error instanceof Error) {
			console.error('Error deactivating workout routines:', error.message);
			throw new Error('Failed to deactivate workout routines');
		} else {
			console.error('Unknown error deactivating workout routines:', error);
			throw new Error('An unknown error occurred while deactivating workout routines');
		}
	}
}
