import { Request, Response } from "express";
import { Macrocycle, Mesocycle, Microcycle } from "../../../shared/models";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { MacrocycleSearchParams, MesocycleSearchParams, MesocycleUpdateRequest, MicrocycleSearchParams, MicrocycleUpdateRequest, ResponseWithError } from "../../../shared/types";
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
                reqBody.isActive ?? false,
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

export const handleGetMesocycle = async (req: Request<{clientId: string}, {}, {}, MesocycleSearchParams>, res: Response<ResponseWithError<Mesocycle[]>>) => {
    const connection = await getDatabaseConnection();
    try {
        const clientId = parseInt(req.params.clientId, 10);
        if (isNaN(clientId)) {
            return res.status(400).json({ hasError: true, errorMessage: "Invalid client ID" });
        }
        const { active, date, macrocycleId } = req.query;

        const macrocycleIdNumber = parseInt(macrocycleId ?? "", 10);

        const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;

        const [rows] = await connection.query<RowDataPacket[]>({
            sql: 'CALL spGetMesocycles(?, ?, ?, ?)',
            values: [
                clientId,
                !isNaN(macrocycleIdNumber) ? macrocycleIdNumber : null,
                activeBool ?? null,
                date ?? null
            ]
        });

        if (!rows || !rows[0]) {
            return res.status(500).json({ hasError: true, errorMessage: "Error when fetching mesocycles" });
        }

        const mesocycles: Mesocycle[] = rows[0].map((row: any) => ({
            id: row.id,
            client_id: row.client_id,
            cycle_name: row.cycle_name,
            macrocycle_id: row.macrocycle_id,
            cycle_start_date: row.cycle_start_date,
            cycle_end_date: row.cycle_end_date,
            optLevels: row.opt_levels ? row.opt_levels.split(",").map((level: string) => parseInt(level, 10)) : undefined,
            cardioLevels: row.cardio_levels ? row.cardio_levels.split(",").map((level: string) => parseInt(level, 10)) : undefined,
            notes: row.notes,
            isActive: row.is_active === 1
        }));

        res.status(200).json(mesocycles);
    } catch (error: Error | unknown) {
        var errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error fetching mesocycle:", error);
        res.status(500).json({ hasError: true, errorMessage });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleCreateMesocycle = async (req: Request<{}, {}, Omit<Mesocycle, 'id' | 'client_id'>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const reqBody = req.body;
        // Validate reqBody here (e.g., check for required fields, data types, etc.)
        if (!reqBody.macrocycle_id || !reqBody.cycle_start_date || !reqBody.cycle_end_date) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const [result] = await connection.execute({
            sql: "CALL spCreateMesocycle(?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                reqBody.macrocycle_id,
                reqBody.cycle_name ?? null,
                reqBody.cycle_start_date,
                reqBody.cycle_end_date,
                reqBody.optLevels ? reqBody.optLevels.join(",") : null,
                reqBody.cardioLevels ? reqBody.cardioLevels.join(",") : null,
                reqBody.notes ?? null,
                reqBody.isActive ?? null,
            ]
        })

        res.status(201).json({ message: "Mesocycle created successfully" });
    } catch (error: Error | unknown) {
        var errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error creating mesocycle:", error);
        res.status(500).json({ error: errorMessage });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleUpdateMesocycle = async (req: Request<{id: string}, {}, MesocycleUpdateRequest>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const mesocycleId = parseInt(req.params.id, 10);
        if (isNaN(mesocycleId)) {
            return res.status(400).json({ error: "Invalid mesocycle ID" });
        }
        
        const reqBody = req.body;
        const [results] = await connection.execute({
            sql: "CALL spUpdateMesocycle(?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                mesocycleId,
                reqBody.cycle_name ?? null,
                reqBody.cycle_start_date ?? null,
                reqBody.cycle_end_date ?? null,
                reqBody.optLevels ? reqBody.optLevels.join(",") : null,
                reqBody.cardioLevels ? reqBody.cardioLevels.join(",") : null,
                reqBody.notes ?? null,
                reqBody.isActive ?? null,
            ]
        })

        res.status(204).send();
    } catch (error: Error | unknown) {
        var errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error updating mesocycle:", error);
        res.status(500).json({ error: errorMessage });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteMesocycle = async (req: Request<{id: string}>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const mesocycleId = parseInt(req.params.id, 10);
        if (isNaN(mesocycleId)) {
            return res.status(400).json({ error: "Invalid mesocycle ID" });
        }

        await connection.execute({
            sql: 'DELETE FROM Mesocycle WHERE id = ?',
            values: [mesocycleId]
        });
        res.status(200).json({ message: "Mesocycle deleted successfully" });
    } catch (error) {
        console.error("Error deleting mesocycle:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetMicrocycle = async (req: Request<{clientId: string}, {}, {}, MicrocycleSearchParams>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const clientId = parseInt(req.params.clientId, 10);
        if (isNaN(clientId)) {
            return res.status(400).json({ error: "Invalid client ID" });
        }
        const { active, date, mesocycleId } = req.query;

        const mesocycleIdNumber = parseInt(mesocycleId ?? "", 10);

        const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;

        const [rows] = await connection.query<RowDataPacket[]>({
            sql: 'CALL spGetMicrocycles(?, ?, ?, ?)',
            values: [
                clientId,
                !isNaN(mesocycleIdNumber) ? mesocycleIdNumber : null,
                activeBool ?? null,
                date ?? null
            ]
        });

        if (!rows || !rows[0]) {
            return res.status(500).json({ error: "Error when fetching microcycles" });
        }

        const microcycles: Microcycle[] = rows[0].map((row: any) => ({
            id: row.id,
            mesocycle_id: row.mesocycle_id,
            cycle_name: row.cycle_name,
            cycle_start_date: row.cycle_start_date,
            cycle_end_date: row.cycle_end_date,
            notes: row.notes,
            isActive: row.is_active === 1
        }));

        res.status(200).json(microcycles);
    } catch (error: Error | unknown) {
        var errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error fetching microcycle:", error);
        res.status(500).json({ error: errorMessage });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleCreateMicrocycle = async (req: Request<{}, {}, Omit<Microcycle, "id" | 'client_id'>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const reqBody = req.body;
        // Validate reqBody here (e.g., check for required fields, data types, etc.)
        if (!reqBody.mesocycle_id || !reqBody.cycle_start_date || !reqBody.cycle_end_date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const [result] = await connection.execute({
            sql: "CALL spCreateMicrocycle(?, ?, ?, ?, ?, ?)",
            values: [
                reqBody.mesocycle_id,
                reqBody.cycle_name ?? null,
                reqBody.cycle_start_date,
                reqBody.cycle_end_date,
                reqBody.notes ?? null,
                reqBody.isActive ?? null,
            ]
        })

        res.status(201).json({ message: "Microcycle created successfully" });
    } catch (error: Error | unknown) {
        var errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error creating microcycle:", error);
        res.status(500).json({ error: errorMessage });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleUpdateMicrocycle = async (req: Request<{id: string}, {}, MicrocycleUpdateRequest>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const microcycleId = parseInt(req.params.id, 10);
        if (isNaN(microcycleId)) {
            return res.status(400).json({ error: "Invalid microcycle ID" });
        }

        const reqBody = req.body;
        const [results] = await connection.execute({
            sql: "CALL spUpdateMicrocycle(?, ?, ?, ?, ?, ?)",
            values: [
                microcycleId,
                reqBody.cycle_name ?? null,
                reqBody.cycle_start_date ?? null,
                reqBody.cycle_end_date ?? null,
                reqBody.notes ?? null,
                reqBody.isActive ?? null,
            ]
        })

        res.status(204).send();
    } catch (error: Error | unknown) {
        var errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error updating microcycle:", error);
        res.status(500).json({ error: errorMessage });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteMicrocycle = async (req: Request<{id: string}>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const microcycleId = parseInt(req.params.id, 10);
        if (isNaN(microcycleId)) {
            return res.status(400).json({ error: "Invalid microcycle ID" });
        }

        const [result] = await connection.execute({
            sql: 'DELETE FROM Microcycle WHERE id = ?',
            values: [microcycleId]
        });

        res.status(200).json({ message: "Microcycle deleted successfully" });
    } catch (error: Error | unknown) {
        var errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Error deleting microcycle:", error);
        res.status(500).json({ error: errorMessage });
    } finally {
        await closeDatabaseConnection(connection);
    }
}