import { Request, Response } from "express";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { AddClientFormValues, DailyUpdateRequest, DashboardData, DashboardResponse, DashboardSummaryQuery, DashboardWeeklySummaryResponse } from "../../../shared/types";
import { Client, ClientContact } from "../../../shared/models";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const handleGetClientContacts = async (req: Request<{ id?: string }>, res: Response) => {
    const { id } = req.params;

    const connection = await getDatabaseConnection();
    try {
        const [results] = await connection.query<RowDataPacket[]>({
            sql: "CALL spGetClientContacts(?)",
            values: [id ? parseInt(id, 10) : null]
        });

        res.status(200).json(results[0] as ClientContact[]);
        
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching client contacts:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error fetching client contacts:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

/**
 * @deprecated - This endpoint is no longer used in the client application, but is left here for potential future use if needed.
 * @param req 
 * @param res 
 * @returns 
 */
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
            height: row.height,
            img: row.img,
            age: row.age,
            notes: row.notes,
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
    } finally {
        await closeDatabaseConnection(connection);
    }
};

// This should not all be handled on this endpoint. This should only take a contact ID and client create data
// TODO: Fix this
export const handleCreateClient = async (req: Request<{}, {}, AddClientFormValues>, res: Response) => {
    const connection = await getDatabaseConnection();

    if (!req.body) {
        await closeDatabaseConnection(connection);
        res.status(400).json({ message: "Request body is required" });
        return;
    }

    const body = req.body;

    try {
        // Insert contact into database
        const [result] = await connection.query<RowDataPacket[][]>({
            sql: "CALL spCreateContact(?, ?, ?, ?, ?, ?)",
            values: [
                body.firstName ?? null,
                body.lastName ?? null,
                body.email ?? null,
                body.phoneNumber ?? null,
                body.dob ?? null,
                body.img64 ?? null,
            ]
        });

        const insertResult = result[0];

        if (!insertResult || insertResult.length === 0 || !insertResult[0]?.id) {
            console.error("Failed to create client:", "Failed to create contact.");
            res.status(500).json({ message: "Failed to create client." });
            return;
        }

        const insertId = insertResult[0].id;

        // Insert client into database
        const [clientResult] = await connection.query<RowDataPacket[][]>({
            sql: "CALL spCreateClient(?, ?, ?, ?)",
            values: [
                insertId,
                body.trainerId,
                body.height ?? null,
                body.notes ?? null
            ]
        });

        const clientInsertResult = clientResult[0];

        if (!clientInsertResult || clientInsertResult.length === 0 || !clientInsertResult[0]?.id) {
            console.error("Failed to create client:", "Failed to create contact.");
            res.status(500).json({ message: "Failed to create client." });
            return;
        }

        // Gonna need this in the create client daily log handler. have to check if it is already there
        // let d = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})); 

        res.status(201).json({ message: "Client created successfully." });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating client:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error creating client:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDailyUpdate = async (req: Request<{}, {}, DailyUpdateRequest>, res: Response) => {
    if (!req.body) {
        res.status(400).json({ message: "Request body is required" });
        return;
    }

    const { date, data } = req.body;
    const connection = await getDatabaseConnection();
    try {

        const [result] = await connection.execute<ResultSetHeader>({
            sql: "CALL spCreateClientDailyLog(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                req.body.clientId, // Assuming clientId is part of the request body
                new Date(date),
                data.weight ?? null,
                data.body_fat ?? null,
                data.calories ?? null,
                data.target_calories ?? null,
                data.protein ?? null,
                data.target_protein ?? null,
                data.carbs ?? null,
                data.target_carbs ?? null,
                data.fats ?? null,
                data.target_fats ?? null
            ]
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error submitting daily update:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error submitting daily update:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }

    res.status(200).json({ message: "Daily update submitted successfully." });

}

export const handleGetDashboard = async (req: Request<{}, {}, {}, { clientId: string, date: string }>, res: Response<DashboardResponse>) => {

    const { clientId, date } = req.query;

    if (!clientId || !date) {
        res.status(400).json({ message: "Client ID and date are required." });
        return;
    }
    const connection = await getDatabaseConnection();
    try {
        const [results] = await connection.query<RowDataPacket[]>({
            sql: "CALL spGetClientDashboard(?, ?)",
            values: [
                parseInt(clientId, 10),
                new Date(date)
            ]
        });

        if (results.length === 0 || !results[0] || results[0].length === 0) {
            res.status(200).json({ message: "no data found" });
            return;
        }

        const dashboardData: DashboardData = {
            clientId: results[0][0].client_id,
            first_name: results[0][0].first_name,
            last_name: results[0][0].last_name,
            email: results[0][0].email,
            phone: results[0][0].phone,
            height: results[0][0].height,
            img: results[0][0].img,
            logged_weight: results[0][0].logged_weight,
            logged_calories: results[0][0].logged_calories,
            logged_body_fat: results[0][0].logged_body_fat,
            logged_protein: results[0][0].logged_protein,
            logged_carbs: results[0][0].logged_carbs,
            logged_fats: results[0][0].logged_fat,
            target_calories: results[0][0].target_calories,
            target_protein: results[0][0].target_protein,
            target_carbs: results[0][0].target_carbs,
            target_fats: results[0][0].target_fat,
            goal: results[0][0].goal,
            goal_weight: results[0][0].goal_weight,
            goal_bodyFat: results[0][0].goal_bodyFat
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching dashboard data:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error fetching dashboard data:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetDashboardSummary = async (req: Request<{}, {}, {}, DashboardSummaryQuery>, res: Response<DashboardWeeklySummaryResponse>) => {
    const { clientId, startDate, endDate } = req.query;

    if (!clientId || !startDate || !endDate) {
        res.status(400).json({ message: "Client ID, start date, and end date are required." });
        return;
    }

    const connection = await getDatabaseConnection();
    try {

        const [results] = await connection.query<RowDataPacket[]>({
            sql: "CALL spGetClientWeeklySummary(?, ?, ?)",
            values: [
                new Date(startDate),
                new Date(endDate),
                parseInt(clientId, 10),
            ]
        });

        if (results.length === 0 || !results[0] || results[0].length === 0) {
            res.status(200).json({ message: "No data found for the specified date range." });
            return;
        }

        res.status(200).json(results[0] as DashboardWeeklySummaryResponse);

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching dashboard weekly summary:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error fetching dashboard weekly summary:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteClient = async (req: Request<{ id: string }>, res: Response) => {
    const connection = await getDatabaseConnection();

    const { id } = req.params;

    try {
        await connection.query({
            sql: "DELETE FROM Client WHERE id = ?",
            values: [parseInt(id, 10)]
        });

        res.status(204).send();

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting client:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error deleting client:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    } finally {
        await closeDatabaseConnection(connection);
    }
}
