import {
	ClientDietLogTodo,
	ClientDietPlan,
	CreateDietPlan,
	DietPlan,
	DietPlanLogEntry,
	GetDietPlanLogEntrySearchParams,
	GetDietPlanSearchParams,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';
import { MessageResponse } from '../../types/utilities';

const toDateOnly = (value: string): Date => {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		throw new Error('Invalid date value');
	}
	return date;
};

export const handleGetDietPlan = async (
	req: Request<{ planId?: string }, {}, {}, GetDietPlanSearchParams>,
	res: Response<DietPlan[] | MessageResponse>
) => {
	try {
		const { planId } = req.params;
		const { clientId, trainerId, isActive } = req.query;
		const parsedPlanId = planId ? parseInt(planId, 10) : undefined;
		const parsedClientId = clientId ? parseInt(clientId, 10) : undefined;
		const parsedTrainerId = trainerId ? parseInt(trainerId, 10) : undefined;
		const parsedIsActive = isActive !== undefined ? isActive === 'true' : planId !== undefined ? undefined : true;

		const dietPlans = await prisma.dietPlan.findMany({
			where: {
				...(parsedPlanId !== undefined && !isNaN(parsedPlanId) ? { id: parsedPlanId } : {}),
				...(parsedClientId !== undefined && !isNaN(parsedClientId) ? { clientId: parsedClientId } : {}),
				...(parsedTrainerId !== undefined && !isNaN(parsedTrainerId) ? { trainerId: parsedTrainerId } : {}),
				...(parsedIsActive !== undefined ? { isActive: parsedIsActive } : {}),
			},
		});

		if (dietPlans.length === 0) {
			return res.status(404).json({ message: 'Diet plan not found' });
		}

		const formattedResults: DietPlan[] = dietPlans.map((plan) => ({
			id: plan.id,
			clientId: plan.clientId,
			trainerId: plan.trainerId,
			planName: plan.planName ?? undefined,
			targetCalories: plan.targetCalories ?? undefined,
			targetProtein: plan.targetProtein ?? undefined,
			targetCarbs: plan.targetCarbs ?? undefined,
			targetFats: plan.targetFats ?? undefined,
			notes: plan.notes ?? undefined,
			isActive: plan.isActive,
			created_at: dayjs.utc(plan.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(plan.updated_at).format('YYYY-MM-DD'),
		}));

		res.json(formattedResults);
	} catch (error) {
		console.error('Error fetching diet plans:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleGetClientsDietPlans = async (
	req: Request<{}, {}, {}, { trainerId?: string }>,
	res: Response<ClientDietPlan[] | MessageResponse>
) => {
	try {
		const { trainerId } = req.query;
		const parsedTrainerId = trainerId ? parseInt(trainerId, 10) : undefined;
		const rows = await prisma.clientDietPlan.findMany({
			where: parsedTrainerId !== undefined && !isNaN(parsedTrainerId) ? { trainerId: parsedTrainerId } : undefined,
		});

		if (rows.length === 0) {
			return res.status(404).json({ message: 'No diet plans found for clients' });
		}

		const dietPlans: ClientDietPlan[] = rows.map((plan) => ({
			first_name: plan.first_name,
			last_name: plan.last_name,
			trainerId: plan.trainerId,
			planName: plan.planName ?? undefined,
			targetCalories: plan.targetCalories ?? undefined,
			targetProtein: plan.targetProtein ?? undefined,
			targetCarbs: plan.targetCarbs ?? undefined,
			targetFats: plan.targetFats ?? undefined,
			notes: plan.notes ?? undefined,
			dietPlanId: plan.dietPlanId ?? undefined,
			clientId: plan.clientId ?? undefined,
		}));

		res.json(dietPlans);
	} catch (error) {
		console.error("Error fetching clients' diet plans:", error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleGetDietLogTodos = async (
	req: Request<{}, {}, {}, { trainerId?: string }>,
	res: Response<ClientDietLogTodo[] | MessageResponse>
) => {
	try {
		const { trainerId } = req.query;
		if (!trainerId) {
			return res.status(400).json({ message: 'trainerId is required' });
		}
		const parsedTrainerId = Number(trainerId);
		if (!Number.isInteger(parsedTrainerId) || parsedTrainerId <= 0) {
			return res.status(400).json({ message: 'trainerId must be a positive integer' });
		}
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const clients = await prisma.client.findMany({
			where: {
				trainerId: parsedTrainerId,
				DietPlan: { some: { isActive: true } },
				NOT: {
					DietPlan: {
						some: {
							isActive: true,
							DietPlanLogEntry: {
								some: { logDate: today },
							},
						},
					},
				},
			},
			select: {
				id: true,
				trainerId: true,
				Contact: {
					select: {
						first_name: true,
						last_name: true,
						email: true,
						phone: true,
					},
				},
				DietPlanLogEntry: {
					orderBy: { logDate: 'desc' },
					take: 1,
					select: { logDate: true },
				},
			},
		});

		const todos: ClientDietLogTodo[] = clients.map((entry) => ({
			clientId: entry.id,
			first_name: entry.Contact.first_name,
			last_name: entry.Contact.last_name,
			email: entry.Contact.email,
			phone: entry.Contact.phone ?? '',
			trainerId: entry.trainerId,
			lastLogDate: entry.DietPlanLogEntry[0]?.logDate?.toISOString().slice(0, 10) ?? undefined,
		}));

		return res.json(todos);
	} catch (error) {
		console.error('Error fetching diet log todos:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleCreateDietPlan = async (req: Request<{}, {}, CreateDietPlan>, res: Response) => {
	try {
		const { clientId, planName, trainerId, targetCalories, targetProtein, targetCarbs, targetFats, notes } = req.body;
		if (!clientId || !trainerId) {
			return res.status(400).json({ message: 'clientId and trainerId are required' });
		}

		const newPlan = await prisma.$transaction(async (tx) => {
			await tx.dietPlan.updateMany({
				where: { clientId, isActive: true },
				data: { isActive: false },
			});

			return tx.dietPlan.create({
				data: {
					clientId,
					trainerId,
					planName: planName,
					targetCalories: targetCalories,
					targetProtein: targetProtein,
					targetCarbs: targetCarbs,
					targetFats: targetFats,
					notes: notes ?? null,
				},
				select: { id: true },
			});
		});

		const insertId = newPlan.id;
		res.status(201).json({
			id: insertId,
			clientId,
			planName,
			trainerId,
			targetCalories,
			targetProtein,
			targetCarbs,
			targetFats,
			notes,
		});
	} catch (error) {
		console.error('Error creating diet plan:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleUpdateDietPlan = async (
	req: Request<{ planId: string }, {}, Partial<Omit<DietPlan, 'id'>>>,
	res: Response
) => {
	try {
		const { planId } = req.params;
		const { planName, targetCalories, targetProtein, targetCarbs, targetFats, isActive, notes } = req.body;
		const parsedPlanId = Number(planId);
		if (!Number.isInteger(parsedPlanId) || parsedPlanId <= 0) {
			return res.status(400).json({ message: 'Invalid planId' });
		}

		const existingPlan = await prisma.dietPlan.findUnique({
			where: { id: parsedPlanId },
			select: { clientId: true },
		});
		if (!existingPlan) {
			return res.status(404).json({ message: 'Diet plan not found' });
		}

		await prisma.$transaction(async (tx) => {
			await tx.dietPlan.update({
				where: { id: parsedPlanId },
				data: {
					...(planName !== undefined ? { planName } : {}),
					...(targetCalories !== undefined ? { targetCalories } : {}),
					...(targetProtein !== undefined ? { targetProtein } : {}),
					...(targetCarbs !== undefined ? { targetCarbs } : {}),
					...(targetFats !== undefined ? { targetFats } : {}),
					...(isActive !== undefined ? { isActive } : {}),
					...(notes !== undefined ? { notes: notes ?? null } : {}),
				},
			});

			if (isActive === true) {
				await tx.dietPlan.updateMany({
					where: {
						id: { not: parsedPlanId },
						clientId: existingPlan.clientId,
					},
					data: { isActive: false },
				});
			}
		});
		res.status(200).json({ message: 'Diet plan updated successfully' });
	} catch (error) {
		console.error('Error updating diet plan:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleDeleteDietPlan = async (req: Request<{ planId: string }>, res: Response) => {
	try {
		const { planId } = req.params;
		if (!planId || planId === '*') {
			return res.status(400).json({ message: 'planId is required' });
		}
		const parsedPlanId = Number(planId);
		if (!Number.isInteger(parsedPlanId) || parsedPlanId <= 0) {
			return res.status(400).json({ message: 'Invalid planId' });
		}
		await prisma.dietPlan.update({ where: { id: parsedPlanId }, data: { isActive: false } });
		res.status(204).send();
	} catch (error: unknown) {
		console.error('Error deleting diet plan:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleCreateDietLog = async (req: Request<{}, {}, Omit<DietPlanLogEntry, 'id' | 'dietPlanId'>>, res: Response) => {
	try {
		const { clientId, logDate, calories, protein, carbs, fats } = req.body;
		if (!clientId) {
			return res.status(400).json({ message: 'clientId is required' });
		}

		const activeDietPlan = await prisma.dietPlan.findFirst({
			where: { clientId, isActive: true },
			select: { id: true },
		});
		if (!activeDietPlan) {
			return res.status(404).json({ message: 'No active diet plan found for client' });
		}

		const createdLog = await prisma.dietPlanLogEntry.create({
			data: {
				dietPlanId: activeDietPlan.id,
				clientId,
				logDate: logDate ? toDateOnly(logDate) : new Date(),
				calories: calories,
				protein: protein,
				carbs: carbs,
				fats: fats,
			},
			select: { id: true },
		});

		res.status(201).json({ id: createdLog.id });
	} catch (error: unknown) {
		console.error('Error creating diet log:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleGetDietLog = async (
	req: Request<{ logId?: string }, {}, {}, GetDietPlanLogEntrySearchParams>,
	res: Response
) => {
	try {
		const { logId } = req.params;
		const { clientId, dietPlanId, logDate, startDate, endDate } = req.query;
		const parsedLogId = logId ? parseInt(logId, 10) : undefined;
		const parsedClientId = clientId ? parseInt(clientId, 10) : undefined;
		const parsedDietPlanId = dietPlanId ? parseInt(dietPlanId, 10) : undefined;
		const parsedLogDate = logDate ? toDateOnly(logDate) : undefined;
		const parsedStartDate = startDate ? toDateOnly(startDate) : undefined;
		const parsedEndDate = endDate ? toDateOnly(endDate) : undefined;
		const logDateFilter = parsedLogDate
			? { equals: parsedLogDate }
			: {
					...(parsedStartDate ? { gte: parsedStartDate } : {}),
					...(parsedEndDate ? { lte: parsedEndDate } : {}),
				};

		const dietLogs = await prisma.dietPlanLogEntry.findMany({
			where: {
				...(parsedLogId !== undefined && !isNaN(parsedLogId) ? { id: parsedLogId } : {}),
				...(parsedClientId !== undefined && !isNaN(parsedClientId) ? { clientId: parsedClientId } : {}),
				...(parsedDietPlanId !== undefined && !isNaN(parsedDietPlanId) ? { dietPlanId: parsedDietPlanId } : {}),
				...(parsedLogDate || parsedStartDate || parsedEndDate ? { logDate: logDateFilter } : {}),
			},
			orderBy: { logDate: 'desc' },
		});

		return res.json(
			dietLogs.map((entry) => ({
				id: entry.id,
				dietPlanId: entry.dietPlanId,
				clientId: entry.clientId,
				logDate: entry.logDate.toISOString().slice(0, 10),
				calories: entry.calories,
				protein: entry.protein,
				carbs: entry.carbs,
				fats: entry.fats,
			}))
		);
	} catch (error: unknown) {
		console.error('Error fetching diet logs:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleUpdateDietLog = async (
	req: Request<{ logId: string }, {}, Partial<Omit<DietPlanLogEntry, 'id' | 'dietPlanId' | 'clientId' | 'logDate'>>>,
	res: Response
) => {
	try {
		const { logId } = req.params;
		const { calories, protein, carbs, fats } = req.body;

		if (!logId || logId === '*') {
			return res.status(400).json({ message: 'logId is required' });
		}
		const parsedLogId = Number(logId);
		if (!Number.isInteger(parsedLogId) || parsedLogId <= 0) {
			return res.status(400).json({ message: 'Invalid logId' });
		}

		await prisma.dietPlanLogEntry.update({
			where: { id: parsedLogId },
			data: {
				...(calories !== undefined ? { calories } : {}),
				...(protein !== undefined ? { protein } : {}),
				...(carbs !== undefined ? { carbs } : {}),
				...(fats !== undefined ? { fats } : {}),
			},
		});

		return res.status(200).json({ message: 'Diet log entry updated successfully' });
	} catch (error: unknown) {
		console.error('Error updating diet log:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleDeleteDietLog = async (req: Request<{ logId: string }>, res: Response) => {
	try {
		const { logId } = req.params;
		if (!logId || logId === '*') {
			return res.status(400).json({ message: 'logId is required' });
		}
		const parsedLogId = Number(logId);
		if (!Number.isInteger(parsedLogId) || parsedLogId <= 0) {
			return res.status(400).json({ message: 'Invalid logId' });
		}

		await prisma.dietPlanLogEntry.delete({ where: { id: parsedLogId } });

		return res.status(204).send();
	} catch (error: unknown) {
		console.error('Error deleting diet log:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};
