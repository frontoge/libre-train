import { Request, Response } from "express";
import { DietPlan } from "../../../shared/models";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { RowDataPacket } from "mysql2";
import { GetDietPlanSearchParams } from "../../../shared/types";

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

        const dietPlans = results[0][0].map(plan => ({
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

export const handleGetDietLog = async (req: Request<{ logId: string }>, res: Response) => {

}

export const handleCreateDietLog = async (req: Request, res: Response) => {

}

export const handleUpdateDietLog = async (req: Request<{ logId: string }>, res: Response) => {

}

export const handleDeleteDietLog = async (req: Request<{ logId: string }>, res: Response) => {

}