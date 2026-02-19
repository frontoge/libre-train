import { Request, Response } from "express";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { AssessmentClientLog, AssessmentType } from "../../../shared/models";
import { AssessmentClientLogCreateRequest, AssessmentClientLogSearchOptions, ResponseWithError } from "../../../shared/types";


export const handleGetAssessmentTypes = async (req: Request<{ id?: string }>, res: Response<ResponseWithError<AssessmentType[]>>) => {
    const connection = await getDatabaseConnection();
    try {

        if (req.params.id !== undefined && isNaN(Number(req.params.id))) {
            res.status(400).json({ hasError: true, errorMessage: 'Invalid assessment type ID. It must be a number.' });
            return;
        }

        const results = await connection.query<RowDataPacket[]>({
            sql: "CALL spGetAssessmentTypes(?)",
            values: [req.params.id ?? null],
        })

        if (!results || !results[0]) {
            res.status(404).json({ hasError: true, errorMessage: 'Assessment type not found.' });
            return;
        }

        const rows = results[0][0];
        const assessmentType: AssessmentType[] = rows?.map((row: any) => ({
            id: row.id,
            name: row.name,
            assessmentUnit: row.assessmentUnit,
            assessmentGroupId: row.assessmentGroupId,
        })) ?? [];

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

export const handleCreateAssessmentLog = async (req: Request<{}, {}, AssessmentClientLogCreateRequest>, res: Response) => {
    const connection = await getDatabaseConnection();

    try {
        const { clientId, assessments } = req.body;
        const insertPromises = assessments.map(assessment => {
            return connection.query({
                sql: "CALL spCreateAssessmentClientLog(?, ?, ?, ?, ?)",
                values: [clientId, assessment.assessmentTypeId, assessment.assessmentValue, assessment.assessmentDate ?? null, assessment.notes ?? null],
            });
        });
        
        await Promise.all(insertPromises);
        res.status(201).json({ message: 'Assessment log(s) created successfully.' });

    } catch (error) {
        console.error('Error creating assessment log:', error);
        res.status(500).json({ hasError: true, errorMessage: 'An error occurred while creating the assessment log.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetAssessmentLog = async (
    req: Request<{ id: string }, {}, {}, AssessmentClientLogSearchOptions>, 
    res: Response<ResponseWithError<AssessmentClientLog[]>>
) => {
    const connection = await getDatabaseConnection();
    try {
        const clientId = Number(req.params.id);
        const { group, type, start, end, page = 1, pageSize = 20 } = req.query;

        if (isNaN(clientId)) {
            res.status(400).json({ hasError: true, errorMessage: 'Invalid client ID. It must be a number.' });
            return;
        }

        const [results] = await connection.query<RowDataPacket[]>({
            sql: `CALL spGetAssessmentClientLog(?, ?, ?, ?, ?, ?, ?)`,
            values: [
                clientId,
                group ?? null,
                type ?? null,
                start ?? null,
                end ?? null,
                page,
                pageSize
            ]
        });
        
        if (!results || !results[0]) {
            res.status(404).json({ hasError: true, errorMessage: 'No assessment logs found for the specified criteria.' });
            return;
        }

        const rows = results[0] as RowDataPacket[];


        if (rows.length === 0) {
            res.status(200).json([]);
            return;
        }

        const assessmentLogs: AssessmentClientLog[] = rows.map(row => ({
            id: row.id,
            clientId: row.clientId,
            assessmentTypeId: row.assessmentTypeId,
            assessmentValue: row.assessmentValue,
            assessmentDate: row.assessmentDate,
            notes: row.notes,
        }));

        res.json(assessmentLogs);

    } catch (error) {
        console.error('Error fetching assessment logs:', error);
        res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching assessment logs.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleUpdateAssessmentLog = async (req: Request<{ id: string }, {}, Omit<AssessmentClientLog, 'id'>>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const logId = Number(req.params.id);
        const { assessmentValue, assessmentDate, clientId, assessmentTypeId, notes } = req.body;

        if (isNaN(logId)) {
            res.status(400).json({ hasError: true, errorMessage: 'Invalid log ID. It must be a number.' });
            return;
        }

        const [results] = await connection.execute<ResultSetHeader>({
            sql: "CALL spUpdateAssessmentClientLog(?, ?, ?, ?, ?, ?)",
            values: [logId, clientId ?? null, assessmentTypeId ?? null, assessmentValue ?? null, assessmentDate ?? null, notes ?? null],
        });

        if (!results || results.affectedRows === 0) {
            res.status(404).json({ hasError: true, errorMessage: 'Assessment log not found.' });
            return;
        }

        res.json({ message: 'Assessment log updated successfully.' });
    } catch (error) {
        console.error('Error updating assessment log:', error);
        res.status(500).json({ hasError: true, errorMessage: 'An error occurred while updating the assessment log.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteAssessmentLog = async (req: Request<{ id: string }>, res: Response) => {
    const connection = await getDatabaseConnection();
    try {
        const logId = Number(req.params.id);

        if (isNaN(logId)) {
            res.status(400).json({ hasError: true, errorMessage: 'Invalid log ID. It must be a number.' });
            return;
        }

        const [results] = await connection.execute<ResultSetHeader>({
            sql: "DELETE FROM AssessmentClientLog WHERE id = ?",
            values: [logId],
        });

        if (results.affectedRows === 0) {
            res.status(404).json({ hasError: true, errorMessage: 'Assessment log not found.' });
            return;
        }

        res.json({ message: 'Assessment log deleted successfully.' });
    } catch (error) {
        console.error('Error deleting assessment log:', error);
        res.status(500).json({ hasError: true, errorMessage: 'An error occurred while deleting the assessment log.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}