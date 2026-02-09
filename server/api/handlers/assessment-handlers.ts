import { Request, Response } from "express";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { RowDataPacket } from "mysql2";
import { AssessmentType } from "../../../shared/models";
import { ResponseWithError } from "../../../shared/types";


export const handleGetAssessmentTypes = async (req: Request<{ id: string }>, res: Response<ResponseWithError<AssessmentType>>) => {
    const connection = await getDatabaseConnection();
    try {

        if (isNaN(Number(req.params.id))) {
            res.status(400).json({ hasError: true, errorMessage: 'Invalid assessment type ID. It must be a number.' });
            return;
        }

        const [results] = await connection.query<RowDataPacket[]>({
            sql: "SELECT * FROM AssessmentType WHERE id = ?",
            values: [req.params.id],
        })

        if (results.length === 0 || !results[0]?.id) {
            res.status(404).json({ hasError: true, errorMessage: 'Assessment type not found.' });
            return;
        }

        const row = results[0];
        const assessmentType: AssessmentType = {
            id: row.id,
            name: row.name,
            assessmentUnit: row.assessmentUnit,
            assessmentGroupId: row.assessmentGroupId,
        };

        res.json(assessmentType);
    } catch (error) {
        console.error('Error fetching assessment type:', error);
        res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching the assessment type.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetAssessmentGroupTypes = async (req: Request<{ id: string }>, res: Response<ResponseWithError<AssessmentType[]>>) => {
    const connection = await getDatabaseConnection();

    try {

        if (isNaN(Number(req.params.id))) {
            res.status(400).json({ hasError: true, errorMessage: 'Invalid assessment group ID. It must be a number.' });
            return;
        }

        const [results] = await connection.query<RowDataPacket[]>({
            sql: "SELECT * FROM AssessmentType WHERE assessmentGroupId = ?",
            values: [req.params.id],
        })

        if (results.length === 0) {
            res.status(404).json({ hasError: true, errorMessage: 'No assessment types found for the specified group.' });
            return;
        }

        const assessmentTypes: AssessmentType[] = results.map(row => ({
            id: row.id,
            name: row.name,
            assessmentUnit: row.assessmentUnit,
            assessmentGroupId: row.assessmentGroupId,
        }));

        res.json(assessmentTypes);
    } catch (error) {
        console.error(`Error fetching assessment types for group: ${req.params.id} - ${error}`);
        res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching assessment types for the group.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}
