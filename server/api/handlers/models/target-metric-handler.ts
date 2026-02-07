import { Request, Response } from 'express';
import { getDatabaseConnection } from '../../../infrastructure/mysql-database';
import { RowDataPacket } from 'mysql2/promise';
import { TargetMetric } from '../../../../shared/models';


export const handleGetTargetMetricModels = async (req: Request, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({sql: "SELECT id, metric_name, target_unit FROM TargetMetric"});

        const formattedResults: TargetMetric[] = results.map(row => ({
            id: row.id,
            metric_name: row.metric_name,
            target_unit: row.target_unit,
        }))
        res.status(200).json(formattedResults);
        
    } catch (error) {
        console.error("Error fetching target metrics:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}