import { Request, Response } from "express";
import { Macrocycle } from "../../../shared/models";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { MacrocycleSearchParams, ResponseWithError } from "../../../shared/types";
import { RowDataPacket } from "mysql2";


export const handleGetMacrocycle = async (req: Request<{clientId: string}, {}, {}, MacrocycleSearchParams>, res: Response<ResponseWithError<Macrocycle[]>>) => {
    const connection = await getDatabaseConnection();
    try {
        const clientId = parseInt(req.params.clientId, 10);
        if (isNaN(clientId)) {
            return res.status(400).json({ hasError: true, errorMessage: "Invalid client ID" });
        }
        const { active, date } = req.query;

        const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;

        const [rows] = await connection.query<RowDataPacket[]>({
            sql: 'CALL spGetMacrocycles(?, ?, ?)',
            values: [
                clientId,
                activeBool ?? null,
                date ?? null
            ]
        });

        if (!rows || !rows[0]) {
            return res.status(500).json({ hasError: true, errorMessage: "Error when fetching macrocycles" });
        }

        const macrocycles: Macrocycle[] = rows[0].map((row: any) => ({
            id: row.id,
            client_id: row.client_id,
            cycle_name: row.cycle_name,
            cycle_start_date: row.cycle_start_date,
            cycle_end_date: row.cycle_end_date,
            isActive: row.is_active === 1,
            notes: row.notes
        }))

        res.status(200).json(macrocycles);
    } catch (error) {
        console.error("Error fetching macrocycle:", error);
        res.status(500).json({ hasError: true, errorMessage: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleCreateMacrocycle = async (req: Request<{}, {}, Omit<Macrocycle, 'id'>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const reqBody = req.body;
        // Validate reqBody here (e.g., check for required fields, data types, etc.)
        if (!reqBody.client_id || !reqBody.cycle_start_date || !reqBody.cycle_end_date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await connection.execute({
            sql: 'CALL spCreateMacrocycle(?, ?, ?, ?, ?, ?)',
            values: [
                reqBody.client_id,
                reqBody.cycle_name ?? null,
                reqBody.cycle_start_date,
                reqBody.cycle_end_date,
                reqBody.isActive ?? null,
                reqBody.notes ?? null
            ]
        });

        res.status(201).json({ message: "Macrocycle created successfully" });
    } catch (error) {
        console.error("Error creating macrocycle:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleUpdateMacrocycle = async (req: Request<{id: string}, {}, Partial<Macrocycle>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const macrocycleId = parseInt(req.params.id, 10);
        if (isNaN(macrocycleId)) {
            return res.status(400).json({ error: "Invalid macrocycle ID" });
        }

        const reqBody = req.body;

        const [results] = await connection.execute({
            sql: 'CALL spUpdateMacrocycle(?, ?, ?, ?, ?, ?)',
            values: [
                macrocycleId,
                reqBody.cycle_name ?? null,
                reqBody.cycle_start_date ?? null,
                reqBody.cycle_end_date ?? null,
                reqBody.isActive ?? null,
                reqBody.notes ?? null
            ]
        })

        res.status(204).send();
    } catch (error) {
        console.error("Error updating macrocycle:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteMacrocycle = async (req: Request<{id: string}>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const macrocycleId = parseInt(req.params.id, 10);
        if (isNaN(macrocycleId)) {
            return res.status(400).json({ error: "Invalid macrocycle ID" });
        }

        await connection.execute({
            sql: 'DELETE FROM Macrocycle WHERE id = ?',
            values: [macrocycleId]
        });
        res.status(200).json({ message: "Macrocycle deleted successfully" });
    } catch (error) {
        console.error("Error deleting macrocycle:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetMesocycle = async (req: Request, res: Response) => {

}

export const handleCreateMesocycle = async (req: Request, res: Response) => {

}

export const handleUpdateMesocycle = async (req: Request, res: Response) => {

}

export const handleDeleteMesocycle = async (req: Request, res: Response) => {

}

export const handleGetMicrocycle = async (req: Request, res: Response) => {

}

export const handleCreateMicrocycle = async (req: Request, res: Response) => {

}

export const handleUpdateMicrocycle = async (req: Request, res: Response) => {

}

export const handleDeleteMicrocycle = async (req: Request, res: Response) => {

}