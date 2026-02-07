import { Request, Response } from 'express';
import { getDatabaseConnection } from '../../../infrastructure/mysql-database';
import { RowDataPacket } from 'mysql2/promise';
import { WorkoutRoutineStage } from '../../../../shared/models';


export const handleGetWorkoutRoutineStage = async (req: Request, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({sql: "SELECT id, stage_name FROM WorkoutRoutineStage"});

        const formattedResults: WorkoutRoutineStage[] = results.map(row => ({
            id: row.id,
            stage_name: row.stage_name,
        }))
        res.status(200).json(formattedResults);
        
    } catch (error) {
        console.error("Error fetching workout routine stages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}