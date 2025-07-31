import { Request, Response } from "express";
import { getDatabaseConnection } from "../../infrastructure/mysql-database";
import { AddClientFormValues, Client } from "../../../shared/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const handleGetClients = async (req: Request, res: Response<Client[] | {message: string}>) => {
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({sql: "SELECT * FROM Client"});

        const clients: Client[] = results.map((row) => ({
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));

        res.json(clients);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: "An unexpected error occurred." });
    } 
};

export const handleCreateClient = async (req: Request<{}, {}, AddClientFormValues>, res: Response) => {
    const connection = await getDatabaseConnection();

    if (!req.body) {
        res.status(400).json({ message: "Request body is required" });
        return;
    }

    const body = req.body;
    
    if (!body.information || !body.goals || !body.measurements) {
        res.status(400).json({ message: "Missing required fields: information, goals, measurements" });
        return;
    }

    const { information, goals, measurements }: AddClientFormValues = body;

    try {
        // Insert client into database
        const [result] = await connection.query<RowDataPacket[][]>({
            sql: "CALL spCreateContact(?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                information.firstName ?? null,
                information.lastName ?? null,
                information.email ?? null,
                information.phone ?? null,
                information.height ?? null,
                information.age ?? null,
                information.img64 ?? null,
                information.notes ?? null
            ]
        });

        const insertResult = result[0];

        if (!insertResult || insertResult.length === 0 || !insertResult[0]?.id) {
            res.status(500).json({ message: "Failed to create client." });
            return;
        }

        const insertId = insertResult[0].id;

        const [dailyLogResult] = await connection.execute<ResultSetHeader>({
            sql: "Call spCreateClientDailyLog(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                insertId,
                measurements.weight ?? null,
                goals.targetWeight ?? null,
                measurements.body_fat ?? null,
                goals.targetBodyFat ?? null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
            ]
        });

        const [measurementResult] = await connection.execute<ResultSetHeader>({
            sql: "CALL spCreateClientMeasurement(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                insertId,
                measurements.wrist ?? null,
                measurements.calves ?? null,
                measurements.biceps ?? null,
                measurements.chest ?? null,
                measurements.thighs ?? null,
                measurements.waist ?? null,
                measurements.shoulders ?? null,
                measurements.hips ?? null,
                measurements.forearm ?? null,
                measurements.neck ?? null
            ]
        });

        if (dailyLogResult.affectedRows === 0 || measurementResult.affectedRows === 0) {
            res.status(500).json({ message: "Failed to create daily log or measurements." });
            return;
        }

        res.status(201).json({ message: "Client created successfully." });


    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: "An unexpected error occurred." });
    }
}
