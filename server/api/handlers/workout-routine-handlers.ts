import { Request, Response } from "express";
import { ResponseWithError, UpdateWorkoutRoutineRequest } from "../../../shared/types";
import { PlannedExercise, PlannedExerciseGroup, WorkoutRoutine } from "../../../shared/models";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { RowDataPacket } from "mysql2";
import { WorkoutRoutineExerciseDTO } from "../../types/dto";
import { mapWorkoutRoutineExerciseDTOToWorkoutRoutine } from "../../mappers/routine-mappers";

export async function handleCreateWorkoutRoutine(req: Request<{}, {}, Omit<WorkoutRoutine, 'id'>>, res: Response) {
    try {
        const workoutRoutineId = await createWorkoutRoutine(req.body);
        res.status(201).json({ workout_routine_id: workoutRoutineId });
    } catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error("Error creating workout routine:", error.message);
            res.status(500).json({ error: "Failed to create workout routine" });
        } else {
            console.error("Unknown error creating workout routine:", error);
            res.status(500).json({ error: "An unknown error occurred while creating workout routine" });
        }
    }
}

export async function handleUpdateWorkoutRoutine(req: Request<{id: string}, {}, UpdateWorkoutRoutineRequest>, res: Response) {
    try {
        const { id } = req.params;
        const { routine_name, exercise_groups } = req.body;
        const existingRoutine = await getWorkoutRoutineById(id);
        if (!existingRoutine) {
            res.status(404).json({ error: "Workout routine not found" });
            return;
        }

        // delete existing routine
        await deleteWorkoutRoutine(id);

        // create new routine with updated data
        const newRoutine = await createWorkoutRoutine({
            ...existingRoutine,
            routine_name: routine_name ?? existingRoutine.routine_name,
            exercise_groups: exercise_groups ?? existingRoutine.exercise_groups
        });

        res.status(200).json({ workout_routine_id: newRoutine });

    } catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error("Error updating workout routine:", error.message);
            res.status(500).json({ error: "Failed to update workout routine" });
        } else {
            console.error("Unknown error updating workout routine:", error);
            res.status(500).json({ error: "An unknown error occurred while updating workout routine" });
        }
    }
}

export async function handleDeleteWorkoutRoutine(req: Request<{ id: string }>, res: Response) {
    try {
        const { id } = req.params;
        await deleteWorkoutRoutine(id);
        res.status(200).json({ message: "Workout routine deleted successfully" });
    } catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error("Error deleting workout routine:", error.message);
            res.status(500).json({ error: "Failed to delete workout routine" });
        } else {
            console.error("Unknown error deleting workout routine:", error);
            res.status(500).json({ error: "An unknown error occurred while deleting workout routine" });
        }
    }
}

export async function handleGetWorkoutRoutine(req: Request, res: Response<ResponseWithError<WorkoutRoutine[]>>) {
    
}

export async function handleGetCycleWorkoutRoutines(req: Request<{ microcycleId: string }>, res: Response<ResponseWithError<WorkoutRoutine[]>>) {
    const connection = await getDatabaseConnection();
    try {
        const { microcycleId } = req.params;
        const [result] = await connection.query<RowDataPacket[]>({
            sql: "CALL spGetMicrocycleRoutines(?)",
            values: [microcycleId]
        });
        
        if (!result) {
            throw new Error("No workout routines found for the specified microcycle");
        }

        const rows = result[0] as WorkoutRoutineExerciseDTO[];

        const workoutRoutines = mapWorkoutRoutineExerciseDTOToWorkoutRoutine(rows);
        res.status(200).json(workoutRoutines);
        
    } catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error("Error fetching workout routines:", error.message);
            res.status(500).json({ hasError: true, errorMessage: "Failed to fetch workout routines" });
        } else {
            console.error("Unknown error fetching workout routines:", error);
            res.status(500).json({ hasError: true, errorMessage: "An unknown error occurred while fetching workout routines" });
        }
    } finally {
        await closeDatabaseConnection(connection);
    }
}

async function deleteWorkoutRoutine(id: string) {
    const connection = await getDatabaseConnection();
    try {
        await connection.execute("CALL spDeleteWorkoutRoutine(?)", [id]);
    } finally {
        await closeDatabaseConnection(connection);
    }
}

async function getWorkoutRoutineById(id: string): Promise<WorkoutRoutine | undefined> {
    const connection = await getDatabaseConnection();
    try {
        const [result] = await connection.query<RowDataPacket[]>({
            sql: "SELECT * FROM WorkoutRoutineExercises WHERE routineId = ?",
            values: [id]
        });
        if (!result) {
            throw new Error("Workout routine not found");
        }

        return mapWorkoutRoutineExerciseDTOToWorkoutRoutine(result as WorkoutRoutineExerciseDTO[])[0];
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export async function createWorkoutRoutine(routine: Omit<WorkoutRoutine, 'id'>): Promise<number | undefined> {
    const connection = await getDatabaseConnection();
    try {
        const { microcycle_id, routine_index, routine_name, isActive, exercise_groups } = routine;
        const [result] = await connection.execute({
            sql: "CALL spCreateWorkoutRoutine(?, ?, ?, ?)", 
            values: [
                microcycle_id,
                routine_index,
                routine_name,
                isActive
        ]});
        const workoutRoutineId = (result as any)[0][0].workout_routine_id;

        // Create the exercise groups for the routine
        await Promise.all(exercise_groups.map(async (group: PlannedExerciseGroup, index: number) => {
            const { rest_between, rest_after, routine_category, exercises } = group;
            const [groupResult] = await connection.execute("CALL spCreatePlannedExerciseGroup(?, ?, ?, ?, ?)", [
                workoutRoutineId,
                index, // group index
                rest_between ?? null,
                rest_after ?? null,
                routine_category
            ]);
            const groupId = (groupResult as any)[0][0].planned_exercise_group_id;

            // Create the exercises for the group
            await Promise.all(exercises.map(async (exercise: PlannedExercise, index: number) => {
                const { exercise_id, repetitions, sets, weight, duration, distance, target_heart_rate, pace, rpe, target_calories, target_mets } = exercise;
                await connection.execute("CALL spCreatePlannedExercise(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                    exercise_id,
                    groupId,
                    index, // exercise index
                    repetitions ?? null,
                    sets ?? null,
                    weight ?? null,
                    duration ?? null,
                    distance ?? null,
                    target_heart_rate ?? null,
                    pace ?? null,
                    rpe ?? null,
                    target_calories ?? null,
                    target_mets ?? null
                ]);
            }))
        }));
        return workoutRoutineId;
    } catch (error) {
        console.error("Error creating workout routine:", error);
        throw new Error("Failed to create workout routine");
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export async function deactivateCycleRoutines(cycleId: number): Promise<void> {
    const connection = await getDatabaseConnection();
    try {
        await connection.execute("UPDATE WorkoutRoutine SET isActive = FALSE WHERE microcycle_id = ?", [cycleId]);
    }
    catch (error: Error | unknown) {
        if (error instanceof Error) {
            console.error("Error deactivating workout routines:", error.message);
            throw new Error("Failed to deactivate workout routines");
        } else {
            console.error("Unknown error deactivating workout routines:", error);
            throw new Error("An unknown error occurred while deactivating workout routines");
        }
    } finally {
        await closeDatabaseConnection(connection);
    }
}