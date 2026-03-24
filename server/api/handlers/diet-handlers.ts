import { Request, Response } from "express";
import { DietPlan, DietPlanLogEntry } from "../../../shared/models";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { RowDataPacket } from "mysql2";
import { GetDietPlanLogEntrySearchParams, GetDietPlanSearchParams } from "../../../shared/types";

export const handleGetDietPlan = async (req: Request<{ planId?: string }, {}, {}, GetDietPlanSearchParams>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { planId } = req.params;
        const { clientId, trainerId, isActive } = req.query;

        const results = await connection.query<RowDataPacket[]>({
            sql: "CALL spGetDietPlan(?, ?, ?, ?)",
            values: [
                planId ?? null,
                clientId ?? null,
                trainerId ?? null,
                isActive !== undefined ? (isActive === 'true' ? 1 : 0) : true
            ]
        });
        if (results[0] === undefined || results[0][0] === undefined) {
            return res.status(404).json({ message: "Diet plan not found" });
        }

        const dietPlans = results[0][0].map((plan: RowDataPacket) => ({
            ...plan,
            isActive: plan.isActive === 1
        }));
        res.json(dietPlans);
    } catch (error) {
        console.error("Error fetching diet plans:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleCreateDietPlan = async (req: Request<{}, {}, Omit<DietPlan, "id" | 'isActive'>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { clientId, planName, trainerId, targetCalories, targetProtein, targetCarbs, targetFats, notes } = req.body;
        if (!clientId || !trainerId) {
            return res.status(400).json({ message: "clientId and trainerId are required" });
        }

        const [result] = await connection.query<RowDataPacket[]>({
            sql: "CALL spCreateDietPlan(?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                clientId,
                trainerId,
                planName ?? null,
                targetCalories,
                targetProtein,
                targetCarbs,
                targetFats,
                notes ?? null
            ]
        });
        const insertId = (result as any)[0].new_plan_id;
        res.status(201).json({ id: insertId, clientId, planName, trainerId, targetCalories, targetProtein, targetCarbs, targetFats, notes });
    } catch (error) {
        console.error("Error creating diet plan:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        closeDatabaseConnection(connection);
    }
}

export const handleUpdateDietPlan = async (req: Request<{ planId: string }, {}, Partial<Omit<DietPlan, "id">>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { planId } = req.params;
        const { planName, targetCalories, targetProtein, targetCarbs, targetFats, isActive, notes } = req.body;
        await connection.query({
            sql: "CALL spUpdateDietPlan(?, ?, ?, ?, ?, ?, ?, ?)",
            values: [
                planId,
                planName ?? null,
                targetCalories ?? null,
                targetProtein ?? null,
                targetCarbs ?? null,
                targetFats ?? null,
                isActive ?? null,
                notes ?? null
            ]
        });
        res.status(200).json({ message: "Diet plan updated successfully" });
    } catch (error) {
        console.error("Error updating diet plan:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteDietPlan = async (req: Request<{ planId: string }>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { planId } = req.params;
        if (!planId || planId === "*") {
            return res.status(400).json({ message: "planId is required" });
        }
        await connection.query({
            sql: "CALL spUpdateDietPlan(?, NULL, NULL, NULL, NULL, NULL, false, NULL)",
            values: [planId]
        });
        res.status(204).send();
    } catch (error: Error | unknown) {
        console.error("Error deleting diet plan:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleCreateDietLog = async (req: Request<{}, {}, Omit<DietPlanLogEntry, "id" | 'dietPlanId'>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { clientId, logDate, calories, protein, carbs, fats } = req.body;
        if (!clientId) {
            return res.status(400).json({ message: "clientId is required" });
        }

        const [result] = await connection.query<RowDataPacket[]>({
            sql: "CALL spCreateDietLogEntry(?, ?, ?, ?, ?, ?)",
            values: [
                clientId,
                logDate ?? null,
                calories,
                protein,
                carbs,
                fats
            ]
        });

        if (result[0] === undefined || result[0][0] === undefined) {
            return res.status(500).json({ message: "Failed to create diet log entry" });
        }

        const insertId = result[0][0].newLogEntryId;
        res.status(201).json({ id: insertId });
    } catch (error: Error | unknown) {
        console.error("Error creating diet log:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetDietLog = async (req: Request<{ logId?: string }, {}, {}, GetDietPlanLogEntrySearchParams>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { logId } = req.params;
        const { clientId, dietPlanId, logDate, startDate, endDate } = req.query;

        const [result] = await connection.query<RowDataPacket[]>({
            sql: "CALL spGetDietLogEntries(?, ?, ?, ?, ?, ?)",
            values: [
                logId ?? null,
                clientId ?? null,
                dietPlanId ?? null,
                logDate ?? null,
                startDate ?? null,
                endDate ?? null
            ]
        });

        const rows = (result as RowDataPacket[][])[0] ?? [];
        const dietLogs = rows.map((entry: RowDataPacket) => ({
            id: entry.id ?? entry.logEntryId,
            dietPlanId: entry.dietPlanId,
            clientId: entry.clientId,
            logDate: entry.logDate,
            calories: entry.calories,
            protein: entry.protein,
            carbs: entry.carbs,
            fats: entry.fats
        }));

        return res.json(dietLogs);
    } catch (error: Error | unknown) {
        console.error("Error fetching diet logs:", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleUpdateDietLog = async (req: Request<{ logId: string }, {}, Partial<Omit<DietPlanLogEntry, "id" | "dietPlanId" | "clientId" | "logDate">>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { logId } = req.params;
        const { calories, protein, carbs, fats } = req.body;

        if (!logId || logId === "*") {
            return res.status(400).json({ message: "logId is required" });
        }

        await connection.query({
            sql: "CALL spUpdateDietLogEntry(?, ?, ?, ?, ?)",
            values: [
                logId,
                calories ?? null,
                protein ?? null,
                carbs ?? null,
                fats ?? null
            ]
        });

        return res.status(200).json({ message: "Diet log entry updated successfully" });
    } catch (error: Error | unknown) {
        console.error("Error updating diet log:", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteDietLog = async (req: Request<{ logId: string }>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const { logId } = req.params;
        if (!logId || logId === "*") {
            return res.status(400).json({ message: "logId is required" });
        }

        await connection.query({
            sql: "CALL spDeleteDietLogEntry(?)",
            values: [logId]
        });

        return res.status(204).send();
    } catch (error: Error | unknown) {
        console.error("Error deleting diet log:", error);
        return res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
    }
}