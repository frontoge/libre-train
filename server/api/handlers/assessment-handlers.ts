import {
	AssessmentClientLog,
	AssessmentClientLogCreateRequest,
	AssessmentClientLogSearchOptions,
	AssessmentType,
	ResponseWithError,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';

export const handleGetAssessmentTypes = async (
	req: Request<{ id?: string }>,
	res: Response<ResponseWithError<AssessmentType[]>>
) => {
	try {
		if (req.params.id !== undefined && isNaN(Number(req.params.id))) {
			res.status(400).json({ hasError: true, errorMessage: 'Invalid assessment type ID. It must be a number.' });
			return;
		}

		const parsedId = req.params.id !== undefined ? Number(req.params.id) : null;
		const rows = await prisma.assessmentType.findMany({
			where: parsedId !== null ? { id: parsedId } : undefined,
		});

		if (parsedId !== null && rows.length === 0) {
			res.status(404).json({ hasError: true, errorMessage: 'Assessment type not found.' });
			return;
		}

		const assessmentType: AssessmentType[] =
			rows?.map((row) => ({
				id: row.id,
				name: row.name,
				assessmentUnit: row.assessmentUnit ?? '',
				assessmentGroupId: row.assessmentGroupId ?? 0,
				created_at: dayjs.utc(row.created_at).toISOString(),
				updated_at: dayjs.utc(row.updated_at).toISOString(),
			})) ?? [];

		res.json(assessmentType);
	} catch (error) {
		console.error('Error fetching assessment type:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching the assessment type.' });
		return;
	}
};

export const handleGetAssessmentGroupTypes = async (
	req: Request<{ id: string }>,
	res: Response<ResponseWithError<AssessmentType[]>>
) => {
	try {
		if (isNaN(Number(req.params.id))) {
			res.status(400).json({ hasError: true, errorMessage: 'Invalid assessment group ID. It must be a number.' });
			return;
		}

		const groupId = Number(req.params.id);

		const results = await prisma.assessmentType.findMany({
			where: { assessmentGroupId: groupId },
		});

		if (results.length === 0) {
			res.status(404).json({ hasError: true, errorMessage: 'No assessment types found for the specified group.' });
			return;
		}

		const assessmentTypes: AssessmentType[] = results.map((row) => ({
			id: row.id,
			name: row.name,
			assessmentUnit: row.assessmentUnit ?? '',
			assessmentGroupId: row.assessmentGroupId ?? 0,
			created_at: dayjs.utc(row.created_at).toISOString(),
			updated_at: dayjs.utc(row.updated_at).toISOString(),
		}));

		res.json(assessmentTypes);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error fetching assessment types for group: ${req.params.id} - ${error.message}`);
		} else {
			console.error(`Error fetching assessment types for group: ${req.params.id} - ${String(error)}`);
		}
		res.status(500).json({
			hasError: true,
			errorMessage: 'An error occurred while fetching assessment types for the group.',
		});
		return;
	}
};

export const handleCreateAssessmentLog = async (req: Request<{}, {}, AssessmentClientLogCreateRequest>, res: Response) => {
	try {
		const { clientId, assessments } = req.body;
		await prisma.$transaction(
			assessments.map((assessment) =>
				prisma.assessmentClientLog.create({
					data: {
						clientId,
						assessmentTypeId: assessment.assessmentTypeId,
						assessmentValue: assessment.assessmentValue,
						assessmentDate: assessment.assessmentDate ? new Date(assessment.assessmentDate) : new Date(),
						notes: assessment.notes ?? null,
					},
				})
			)
		);
		res.status(201).json({ message: 'Assessment log(s) created successfully.' });
	} catch (error) {
		console.error('Error creating assessment log:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while creating the assessment log.' });
		return;
	}
};

export const handleGetAssessmentLog = async (
	req: Request<{ id: string }, {}, {}, AssessmentClientLogSearchOptions>,
	res: Response<ResponseWithError<AssessmentClientLog[]>>
) => {
	try {
		const clientId = Number(req.params.id);
		const { group, type, start, end, page = 1, pageSize = 20 } = req.query;

		if (isNaN(clientId)) {
			res.status(400).json({ hasError: true, errorMessage: 'Invalid client ID. It must be a number.' });
			return;
		}

		const parsedGroupId = group ? Number(group) : null;
		const parsedTypeId = type ? Number(type) : null;
		const parsedPage = Number(page);
		const parsedPageSize = Number(pageSize);

		const rows = await prisma.assessmentClientLog.findMany({
			where: {
				clientId,
				assessmentTypeId: parsedTypeId ?? undefined,
				assessmentDate: {
					gte: start ? new Date(start) : undefined,
					lte: end ? new Date(end) : undefined,
				},
				AssessmentType: parsedGroupId !== null ? { is: { assessmentGroupId: parsedGroupId } } : undefined,
			},
			skip: parsedPageSize * (parsedPage - 1),
			take: parsedPageSize,
			orderBy: { assessmentDate: 'desc' },
		});

		if (rows.length === 0) {
			res.status(200).json([]);
			return;
		}

		const assessmentLogs: AssessmentClientLog[] = rows.map((row) => ({
			id: row.id,
			clientId: row.clientId,
			assessmentTypeId: row.assessmentTypeId,
			assessmentValue: row.assessmentValue,
			assessmentDate:
				row.assessmentDate instanceof Date ? row.assessmentDate.toISOString().slice(0, 10) : String(row.assessmentDate),
			notes: row.notes ?? undefined,
		}));

		res.json(assessmentLogs);
	} catch (error) {
		console.error('Error fetching assessment logs:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching assessment logs.' });
		return;
	}
};

export const handleUpdateAssessmentLog = async (
	req: Request<{ id: string }, {}, Omit<AssessmentClientLog, 'id'>>,
	res: Response
) => {
	try {
		const logId = Number(req.params.id);
		const { assessmentValue, assessmentDate, clientId, assessmentTypeId, notes } = req.body;

		if (isNaN(logId)) {
			res.status(400).json({ hasError: true, errorMessage: 'Invalid log ID. It must be a number.' });
			return;
		}

		const { count: affectedRows } = await prisma.assessmentClientLog.updateMany({
			where: { id: logId },
			data: {
				clientId: clientId ?? undefined,
				assessmentTypeId: assessmentTypeId ?? undefined,
				assessmentValue: assessmentValue ?? undefined,
				assessmentDate: assessmentDate ? new Date(assessmentDate) : undefined,
				notes: notes ?? undefined,
			},
		});

		if (!affectedRows || affectedRows === 0) {
			res.status(404).json({ hasError: true, errorMessage: 'Assessment log not found.' });
			return;
		}

		res.json({ message: 'Assessment log updated successfully.' });
	} catch (error) {
		console.error('Error updating assessment log:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while updating the assessment log.' });
		return;
	}
};

export const handleDeleteAssessmentLog = async (req: Request<{ id: string }>, res: Response) => {
	try {
		const logId = Number(req.params.id);

		if (isNaN(logId)) {
			res.status(400).json({ hasError: true, errorMessage: 'Invalid log ID. It must be a number.' });
			return;
		}

		const { count: affectedRows } = await prisma.assessmentClientLog.deleteMany({
			where: { id: logId },
		});

		if (affectedRows === 0) {
			res.status(404).json({ hasError: true, errorMessage: 'Assessment log not found.' });
			return;
		}

		res.json({ message: 'Assessment log deleted successfully.' });
	} catch (error) {
		console.error('Error deleting assessment log:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while deleting the assessment log.' });
		return;
	}
};
