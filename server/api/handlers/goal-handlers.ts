import {
	ClientGoalSearchParams,
	ClientGoalWithRelations,
	CreateClientGoalRequest,
	CycleLevel,
	GoalAssessmentInput,
	GoalStatus,
	ResponseWithError,
	UpdateClientGoalRequest,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { Prisma, prisma } from '../../database/mysql-database';

const VALID_STATUSES = ['planned', 'in_progress', 'achieved', 'missed', 'abandoned'] as const;
const VALID_CYCLE_LEVELS = ['macrocycle', 'mesocycle', 'microcycle'] as const;

const isValidStatus = (value: unknown): value is GoalStatus =>
	typeof value === 'string' && (VALID_STATUSES as readonly string[]).includes(value);

const isValidCycleLevel = (value: unknown): value is CycleLevel =>
	typeof value === 'string' && (VALID_CYCLE_LEVELS as readonly string[]).includes(value);

const countCycleFks = (macro?: number | null, meso?: number | null, micro?: number | null): number =>
	[macro, meso, micro].filter((value) => typeof value === 'number' && value > 0).length;

const formatDate = (value: Date | null | undefined): string | undefined =>
	value ? dayjs.utc(value).format('YYYY-MM-DD') : undefined;

const goalRelationInclude = {
	Macrocycle: true,
	Mesocycle: true,
	Microcycle: true,
	Client: { include: { Contact: true } },
	ClientGoalAssessment: { include: { AssessmentType: true } },
} as const;

type GoalRowWithRelations = Prisma.ClientGoalGetPayload<{ include: typeof goalRelationInclude }>;

const serializeGoal = (row: GoalRowWithRelations): ClientGoalWithRelations => {
	const base: ClientGoalWithRelations = {
		id: row.id,
		client_id: row.client_id,
		macrocycle_id: row.macrocycle_id ?? undefined,
		mesocycle_id: row.mesocycle_id ?? undefined,
		microcycle_id: row.microcycle_id ?? undefined,
		description: row.description ?? undefined,
		target_date: formatDate(row.target_date),
		status: row.status as GoalStatus,
		created_at: formatDate(row.created_at) ?? '',
		updated_at: formatDate(row.updated_at) ?? '',
		assessments: row.ClientGoalAssessment.map((assessment) => ({
			id: assessment.id,
			client_goal_id: assessment.client_goal_id,
			assessment_type_id: assessment.assessment_type_id,
			target_value: assessment.target_value,
			created_at: formatDate(assessment.created_at) ?? '',
			updated_at: formatDate(assessment.updated_at) ?? '',
			AssessmentType: {
				id: assessment.AssessmentType.id,
				name: assessment.AssessmentType.name,
				assessmentUnit: assessment.AssessmentType.assessmentUnit ?? undefined,
			},
		})),
	};

	if (row.Macrocycle) {
		base.Macrocycle = {
			id: row.Macrocycle.id,
			cycle_name: row.Macrocycle.cycle_name ?? undefined,
			cycle_start_date: dayjs.utc(row.Macrocycle.cycle_start_date).format('YYYY-MM-DD'),
			cycle_end_date: dayjs.utc(row.Macrocycle.cycle_end_date).format('YYYY-MM-DD'),
			is_active: row.Macrocycle.is_active,
		};
	}
	if (row.Mesocycle) {
		base.Mesocycle = {
			id: row.Mesocycle.id,
			cycle_name: row.Mesocycle.cycle_name ?? undefined,
			cycle_start_date: dayjs.utc(row.Mesocycle.cycle_start_date).format('YYYY-MM-DD'),
			cycle_end_date: dayjs.utc(row.Mesocycle.cycle_end_date).format('YYYY-MM-DD'),
			is_active: row.Mesocycle.is_active,
		};
	}
	if (row.Microcycle) {
		base.Microcycle = {
			id: row.Microcycle.id,
			cycle_name: row.Microcycle.cycle_name ?? undefined,
			cycle_start_date: dayjs.utc(row.Microcycle.cycle_start_date).format('YYYY-MM-DD'),
			cycle_end_date: dayjs.utc(row.Microcycle.cycle_end_date).format('YYYY-MM-DD'),
			is_active: row.Microcycle.is_active,
		};
	}
	if (row.Client?.Contact) {
		base.Client = {
			id: row.Client.id,
			first_name: row.Client.Contact.first_name,
			last_name: row.Client.Contact.last_name,
		};
	}

	return base;
};

const normalizeAssessments = (input: GoalAssessmentInput[] | undefined): GoalAssessmentInput[] | undefined => {
	if (!input) return undefined;
	const cleaned: GoalAssessmentInput[] = [];
	for (const entry of input) {
		if (
			typeof entry.assessment_type_id !== 'number'
			|| !Number.isInteger(entry.assessment_type_id)
			|| entry.assessment_type_id <= 0
		) {
			return null as unknown as GoalAssessmentInput[];
		}
		if (typeof entry.target_value !== 'string' || entry.target_value.trim().length === 0) {
			return null as unknown as GoalAssessmentInput[];
		}
		cleaned.push({ assessment_type_id: entry.assessment_type_id, target_value: entry.target_value.trim() });
	}
	return cleaned;
};

const resolveCycleStartDate = async (
	macroId?: number | null,
	mesoId?: number | null,
	microId?: number | null
): Promise<Date | null> => {
	if (macroId) {
		const row = await prisma.macrocycle.findUnique({
			where: { id: macroId },
			select: { cycle_start_date: true },
		});
		return row?.cycle_start_date ?? null;
	}
	if (mesoId) {
		const row = await prisma.mesocycle.findUnique({
			where: { id: mesoId },
			select: { cycle_start_date: true },
		});
		return row?.cycle_start_date ?? null;
	}
	if (microId) {
		const row = await prisma.microcycle.findUnique({
			where: { id: microId },
			select: { cycle_start_date: true },
		});
		return row?.cycle_start_date ?? null;
	}
	return null;
};

const inferStatus = (cycleStartDate: Date | null): GoalStatus => {
	if (!cycleStartDate) return 'planned';
	const startOfToday = dayjs().startOf('day').toDate();
	return cycleStartDate > startOfToday ? 'planned' : 'in_progress';
};

export const handleGetClientGoals = async (
	req: Request<{}, {}, {}, ClientGoalSearchParams>,
	res: Response<ResponseWithError<ClientGoalWithRelations[]>>
) => {
	try {
		const { clientId, trainerId, status, cycleLevel, cycleId, activeCyclesOnly } = req.query;

		const where: Prisma.ClientGoalWhereInput = {};

		if (clientId !== undefined) {
			const parsedClientId = Number(clientId);
			if (!Number.isInteger(parsedClientId) || parsedClientId <= 0) {
				return res.status(400).json({ hasError: true, errorMessage: 'clientId must be a positive integer' });
			}
			where.client_id = parsedClientId;
		} else if (trainerId !== undefined) {
			const parsedTrainerId = Number(trainerId);
			if (!Number.isInteger(parsedTrainerId) || parsedTrainerId <= 0) {
				return res.status(400).json({ hasError: true, errorMessage: 'trainerId must be a positive integer' });
			}
			where.Client = { trainerId: parsedTrainerId };
		} else {
			return res.status(400).json({ hasError: true, errorMessage: 'clientId or trainerId is required' });
		}

		if (status) {
			if (!isValidStatus(status)) {
				return res.status(400).json({ hasError: true, errorMessage: 'Invalid status' });
			}
			where.status = status;
		}

		if (cycleLevel) {
			if (!isValidCycleLevel(cycleLevel)) {
				return res.status(400).json({ hasError: true, errorMessage: 'Invalid cycleLevel' });
			}
			const parsedCycleId = cycleId !== undefined ? Number(cycleId) : undefined;
			if (cycleId !== undefined && (!Number.isInteger(parsedCycleId) || (parsedCycleId as number) <= 0)) {
				return res.status(400).json({ hasError: true, errorMessage: 'Invalid cycleId' });
			}
			if (cycleLevel === CycleLevel.Macrocycle) {
				where.macrocycle_id = parsedCycleId ?? { not: null };
			} else if (cycleLevel === CycleLevel.Mesocycle) {
				where.mesocycle_id = parsedCycleId ?? { not: null };
			} else {
				where.microcycle_id = parsedCycleId ?? { not: null };
			}
		}

		if (activeCyclesOnly === 'true') {
			where.OR = [
				{ Macrocycle: { is_active: true } },
				{ Mesocycle: { is_active: true } },
				{ Microcycle: { is_active: true } },
			];
		}

		const rows = await prisma.clientGoal.findMany({
			where,
			include: goalRelationInclude,
			orderBy: [{ target_date: 'asc' }, { created_at: 'desc' }],
		});

		return res.status(200).json(rows.map(serializeGoal));
	} catch (error) {
		console.error('Error fetching client goals:', error);
		return res.status(500).json({ hasError: true, errorMessage: 'Internal server error' });
	}
};

export const handleGetClientGoalById = async (
	req: Request<{ id: string }>,
	res: Response<ResponseWithError<ClientGoalWithRelations>>
) => {
	try {
		const goalId = Number(req.params.id);
		if (!Number.isInteger(goalId) || goalId <= 0) {
			return res.status(400).json({ hasError: true, errorMessage: 'Invalid goal id' });
		}

		const row = await prisma.clientGoal.findUnique({
			where: { id: goalId },
			include: goalRelationInclude,
		});

		if (!row) {
			return res.status(404).json({ hasError: true, errorMessage: 'Goal not found' });
		}

		return res.status(200).json(serializeGoal(row));
	} catch (error) {
		console.error('Error fetching client goal:', error);
		return res.status(500).json({ hasError: true, errorMessage: 'Internal server error' });
	}
};

export const handleCreateClientGoal = async (
	req: Request<{}, {}, CreateClientGoalRequest>,
	res: Response<{ goalId: number } | { error: string }>
) => {
	try {
		const body = req.body;
		if (!body.client_id) {
			return res.status(400).json({ error: 'client_id is required' });
		}

		const cycleFkCount = countCycleFks(body.macrocycle_id, body.mesocycle_id, body.microcycle_id);
		if (cycleFkCount !== 1) {
			return res
				.status(400)
				.json({ error: 'Exactly one of macrocycle_id, mesocycle_id, or microcycle_id must be provided' });
		}

		const assessments = normalizeAssessments(body.assessments);
		if (!assessments || assessments.length === 0) {
			return res.status(400).json({ error: 'At least one assessment target is required' });
		}

		const cycleStartDate = await resolveCycleStartDate(body.macrocycle_id, body.mesocycle_id, body.microcycle_id);
		if (!cycleStartDate) {
			return res.status(404).json({ error: 'Referenced cycle not found' });
		}
		const status = inferStatus(cycleStartDate);

		const created = await prisma.$transaction(async (tx) => {
			const goal = await tx.clientGoal.create({
				data: {
					client_id: body.client_id,
					macrocycle_id: body.macrocycle_id ?? null,
					mesocycle_id: body.mesocycle_id ?? null,
					microcycle_id: body.microcycle_id ?? null,
					description: body.description ?? null,
					target_date: body.target_date ? new Date(body.target_date) : null,
					status,
				},
				select: { id: true },
			});
			await tx.clientGoalAssessment.createMany({
				data: assessments.map((entry) => ({
					client_goal_id: goal.id,
					assessment_type_id: entry.assessment_type_id,
					target_value: entry.target_value,
				})),
			});
			return goal;
		});

		return res.status(201).json({ goalId: created.id });
	} catch (error) {
		console.error('Error creating client goal:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

export const handleUpdateClientGoal = async (req: Request<{ id: string }, {}, UpdateClientGoalRequest>, res: Response) => {
	try {
		const goalId = Number(req.params.id);
		if (!Number.isInteger(goalId) || goalId <= 0) {
			return res.status(400).json({ error: 'Invalid goal id' });
		}

		const existing = await prisma.clientGoal.findUnique({ where: { id: goalId } });
		if (!existing) {
			return res.status(404).json({ error: 'Goal not found' });
		}

		const body = req.body;

		const nextMacro = body.macrocycle_id !== undefined ? (body.macrocycle_id ?? null) : existing.macrocycle_id;
		const nextMeso = body.mesocycle_id !== undefined ? (body.mesocycle_id ?? null) : existing.mesocycle_id;
		const nextMicro = body.microcycle_id !== undefined ? (body.microcycle_id ?? null) : existing.microcycle_id;
		if (countCycleFks(nextMacro, nextMeso, nextMicro) !== 1) {
			return res.status(400).json({ error: 'Exactly one of macrocycle_id, mesocycle_id, or microcycle_id must be set' });
		}

		if (body.status !== undefined && !isValidStatus(body.status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}

		const assessments = normalizeAssessments(body.assessments);
		if (body.assessments !== undefined && (!assessments || assessments.length === 0)) {
			return res.status(400).json({ error: 'At least one assessment target is required' });
		}

		await prisma.$transaction(async (tx) => {
			await tx.clientGoal.update({
				where: { id: goalId },
				data: {
					...(body.macrocycle_id !== undefined ? { macrocycle_id: body.macrocycle_id ?? null } : {}),
					...(body.mesocycle_id !== undefined ? { mesocycle_id: body.mesocycle_id ?? null } : {}),
					...(body.microcycle_id !== undefined ? { microcycle_id: body.microcycle_id ?? null } : {}),
					...(body.description !== undefined ? { description: body.description ?? null } : {}),
					...(body.target_date !== undefined
						? { target_date: body.target_date ? new Date(body.target_date) : null }
						: {}),
					...(body.status !== undefined ? { status: body.status } : {}),
				},
			});
			if (assessments) {
				await tx.clientGoalAssessment.deleteMany({ where: { client_goal_id: goalId } });
				await tx.clientGoalAssessment.createMany({
					data: assessments.map((entry) => ({
						client_goal_id: goalId,
						assessment_type_id: entry.assessment_type_id,
						target_value: entry.target_value,
					})),
				});
			}
		});

		return res.status(204).send();
	} catch (error) {
		console.error('Error updating client goal:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

export const handleDeleteClientGoal = async (req: Request<{ id: string }>, res: Response) => {
	try {
		const goalId = Number(req.params.id);
		if (!Number.isInteger(goalId) || goalId <= 0) {
			return res.status(400).json({ error: 'Invalid goal id' });
		}

		await prisma.clientGoal.delete({ where: { id: goalId } });
		return res.status(204).send();
	} catch (error) {
		console.error('Error deleting client goal:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
};
