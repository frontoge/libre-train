import { Request, Response } from "express";
import { getDatabaseConnection } from "../../infrastructure/mysql-database";
import { AddClientFormValues, Client, DailyUpdateRequest, DashboardData, DashboardResponse } from "../../../shared/types";
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
            sql: "CALL spCreateClient(?, ?, ?, ?, ?, ?, ?, ?)",
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
            console.error("Failed to create client:", "Failed to create contact.");
            res.status(500).json({ message: "Failed to create client." });
            return;
        }

        const insertId = insertResult[0].id;

        let d = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})); 

        const [dailyLogResult] = await connection.execute<ResultSetHeader>({
            sql: "Call spCreateClientDailyLog(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                insertId,
                d,
                measurements.weight ?? null,
                measurements.body_fat ?? null,
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

        const [goalResult] = await connection.execute<ResultSetHeader>({
            sql: "CALL spCreateClientGoal(?, ?, ?, ?, ?)",
            values: [
                insertId,
                goals.goal ?? null,
                goals.targetWeight ?? null,
                goals.targetBodyFat ?? null,
                new Date()
            ]
        });

        if (dailyLogResult.affectedRows === 0 || measurementResult.affectedRows === 0 || goalResult.affectedRows === 0) {
            console.error("Failed to create daily log or measurements:", "Failed to create daily log or measurements.");
            res.status(500).json({ message: "Failed to create daily log or measurements." });
            return;
        }

        res.status(201).json({ message: "Client created successfully." });


    } catch (error) {
        if (error instanceof Error) {
            console.error("Error creating client:", error.message);
            res.status(500).json({ message: error.message });
            return;
        }
        console.error("Unexpected error creating client:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
    }
}

export const handleDailyUpdate = async (req: Request<{}, {}, DailyUpdateRequest>, res: Response) => {
    const connection = await getDatabaseConnection();

    if (!req.body) {
        res.status(400).json({ message: "Request body is required" });
        return;
    }

    const { date, data } = req.body;
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
    }

    res.status(200).json({ message: "Daily update submitted successfully." });

}

export const handleGetDashboard = async (req: Request<{}, {}, {}, { clientId: string, date: string }>, res: Response<DashboardResponse>) => {
    const connection = await getDatabaseConnection();

    const { clientId, date } = req.query;

    if (!clientId || !date) {
        res.status(400).json({ message: "Client ID and date are required." });
        return;
    }

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
    }
}
