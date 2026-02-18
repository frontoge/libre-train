import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database"
import { Request, Response } from "express";
import { ResponseWithError } from "../../../shared/types";
import { RowDataPacket } from "mysql2";
import { Exercise } from "../../../shared/models";

export const handleExerciseCreate = async (req: Request<{}, {}, Omit<Exercise, 'id'>>, res: Response) => { 
    const connection = await getDatabaseConnection();
    try {
        const { exercise_name, muscle_groups, exercise_description, video_link, equipment, exercise_form, movement_pattern, progression_level } = req.body;
        const [results, fields] = await connection.execute("CALL spCreateExercise(?, ?, ?, ?, ?, ?, ?, ?)", [
            exercise_name,
            muscle_groups ? muscle_groups.join(',') : null,
            exercise_description ?? null,
            video_link ?? null,
            equipment ?? null,
            exercise_form,
            movement_pattern ?? null,
            progression_level ?? null
        ]);
        res.status(201).json({ message: "Exercise created successfully" });

    } catch (error) {
        console.error("Error creating exercise:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetAllExercises = async (req: Request, res: Response<ResponseWithError<Exercise[]>>) => {
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({sql: "SELECT * FROM Exercise"});

        const formattedResults: Exercise[] = results.map(row => ({
            id: row.id.toString(),
            exercise_name: row.exercise_name,
            muscle_groups: row.muscle_groups.split(',').map((mg: string) => parseInt(mg, 10)),
            video_link: row.video_link,
            exercise_description: row.exercise_description,
            equipment: row.equipment,
            exercise_form: row.exercise_form,
            movement_pattern: row.movement_pattern,
            progression_level: row.progression_level,
        }))
        res.status(200).json(formattedResults);
        
    } catch (error) {
        console.error("Error fetching exercises:", error);
        res.status(500).json({ hasError: true, errorMessage: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteExercise = async (req: Request<{ id: string }>, res: Response) => {

    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "Exercise ID is required" });
    }

    const connection = await getDatabaseConnection();
    try {
        await connection.query({
            sql: "DELETE FROM Exercise WHERE id = ?",
            values: [parseInt(id, 10)]
        });

        res.status(204).send();

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting exercise:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error deleting exercise:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleUpdateExercise = async (req: Request<{ id: string }, {}, Omit<Partial<Exercise>, 'id'>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { id } = req.params;
        const { exercise_name, muscle_groups, exercise_description, video_link, equipment, exercise_form, movement_pattern, progression_level } = req.body;

        if (!id) {
            return res.status(400).json({ message: "Exercise ID is required" });
        }

        const [results, fields] = await connection.query<RowDataPacket[]>({
            sql: 'CALL spUpdateExercise(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            values: [
                id,
                exercise_name ?? null,
                muscle_groups ? muscle_groups.join(',') : null,
                exercise_description ?? null,
                video_link ?? null,
                equipment ?? null,
                exercise_form ?? null,
                movement_pattern ?? null,
                progression_level ?? null
            ]
        })

        res.status(204).send();
        
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error updating exercise:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error updating exercise:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }
}