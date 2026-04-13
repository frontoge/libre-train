import {
	ClientTrainingPlanTodo,
	CreateWorkoutRoutine,
	Macrocycle,
	MacrocycleSearchParams,
	Mesocycle,
	MesocycleSearchParams,
	MesocycleUpdateRequest,
	Microcycle,
	MicrocycleSearchParams,
	MicrocycleUpdateRequest,
	MicrocycleUpdateRoutinesRequest,
	ResponseWithError,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';
import { createWorkoutRoutine, deactivateCycleRoutines } from './workout-routine-handlers';

const isValidDate = (value: Date): boolean => !Number.isNaN(value.getTime());

const parseDateIfPresent = (value?: string): Date | undefined => {
	if (!value) {
		return undefined;
	}

	const parsedDate = new Date(value);
	return isValidDate(parsedDate) ? parsedDate : undefined;
};

export const handleGetTrainingPlanTodos = async (req: Request<{}, {}, {}, { trainerId?: string }>, res: Response) => {
	try {
		const { trainerId } = req.query;
		if (!trainerId) {
			return res.status(400).json({ message: 'trainerId is required' });
		}

		const parsedTrainerId = Number(trainerId);
		if (!Number.isInteger(parsedTrainerId) || parsedTrainerId <= 0) {
			return res.status(400).json({ message: 'trainerId must be a positive integer' });
		}

		const clients = await prisma.client.findMany({
			where: {
				trainerId: parsedTrainerId,
				Macrocycle: { none: { is_active: true } },
				Mesocycle: { none: { is_active: true } },
				Microcycle: { none: { is_active: true } },
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
			},
		});

		const todos: ClientTrainingPlanTodo[] = clients.map((client) => ({
			clientId: client.id,
			first_name: client.Contact.first_name,
			last_name: client.Contact.last_name,
			email: client.Contact.email,
			phone: client.Contact.phone ?? '',
			trainerId: client.trainerId,
		}));

		return res.json(todos);
	} catch (error) {
		console.error('Error fetching training plan todos:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleGetMacrocycle = async (
	req: Request<{ clientId: string }, {}, {}, MacrocycleSearchParams>,
	res: Response<ResponseWithError<Macrocycle[]>>
) => {
	try {
		const clientId = parseInt(req.params.clientId, 10);
		if (isNaN(clientId)) {
			return res.status(400).json({ hasError: true, errorMessage: 'Invalid client ID' });
		}
		const { active, date } = req.query;
		const filterDate = parseDateIfPresent(date);

		const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;

		const macrocyclesResult = await prisma.macrocycle.findMany({
			where: {
				client_id: clientId,
				...(activeBool !== undefined ? { is_active: activeBool } : {}),
				...(filterDate
					? {
							cycle_start_date: { lte: filterDate },
							cycle_end_date: { gte: filterDate },
						}
					: {}),
			},
			orderBy: { cycle_start_date: 'desc' },
		});

		if (macrocyclesResult.length === 0) {
			return res.status(200).json([]);
		}

		const macrocycles: Macrocycle[] = macrocyclesResult.map((row) => ({
			id: row.id,
			client_id: row.client_id,
			cycle_name: row.cycle_name ?? undefined,
			cycle_start_date: dayjs.utc(row.cycle_start_date).format('YYYY-MM-DD'),
			cycle_end_date: dayjs.utc(row.cycle_end_date).format('YYYY-MM-DD'),
			is_active: row.is_active,
			notes: row.notes ?? undefined,
			created_at: dayjs.utc(row.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(row.updated_at).format('YYYY-MM-DD'),
		}));

		res.status(200).json(macrocycles);
	} catch (error) {
		console.error('Error fetching macrocycle:', error);
		res.status(500).json({ hasError: true, errorMessage: 'Internal server error' });
	}
};

export const handleCreateMacrocycle = async (req: Request<{}, {}, Omit<Macrocycle, 'id'>>, res: Response) => {
	try {
		const reqBody = req.body;
		if (!reqBody.client_id || !reqBody.cycle_start_date || !reqBody.cycle_end_date) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const cycleStartDate = new Date(reqBody.cycle_start_date);
		const cycleEndDate = new Date(reqBody.cycle_end_date);
		if (!isValidDate(cycleStartDate) || !isValidDate(cycleEndDate) || cycleStartDate > cycleEndDate) {
			return res.status(400).json({ error: 'Start date must be before end date' });
		}

		const shouldDeactivateOverlaps = reqBody.is_active === true;
		const newMacrocycle = await prisma.$transaction(async (tx) => {
			if (shouldDeactivateOverlaps) {
				await tx.macrocycle.updateMany({
					where: {
						client_id: reqBody.client_id,
						is_active: true,
						cycle_end_date: { gte: cycleStartDate },
						cycle_start_date: { lte: cycleEndDate },
					},
					data: { is_active: false },
				});
			}

			return tx.macrocycle.create({
				data: {
					client_id: reqBody.client_id,
					cycle_name: reqBody.cycle_name ?? null,
					cycle_start_date: cycleStartDate,
					cycle_end_date: cycleEndDate,
					is_active: reqBody.is_active ?? false,
					notes: reqBody.notes ?? null,
				},
				select: { id: true },
			});
		});

		res.status(201).json({ macrocycleId: newMacrocycle.id });
	} catch (error) {
		console.error('Error creating macrocycle:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const handleUpdateMacrocycle = async (req: Request<{ id: string }, {}, Partial<Macrocycle>>, res: Response) => {
	try {
		const macrocycleId = parseInt(req.params.id, 10);
		if (isNaN(macrocycleId)) {
			return res.status(400).json({ error: 'Invalid macrocycle ID' });
		}

		const reqBody = req.body;
		const existingMacrocycle = await prisma.macrocycle.findUnique({ where: { id: macrocycleId } });
		if (!existingMacrocycle) {
			return res.status(404).json({ error: 'Macrocycle not found' });
		}

		const nextStartDate = reqBody.cycle_start_date ? new Date(reqBody.cycle_start_date) : existingMacrocycle.cycle_start_date;
		const nextEndDate = reqBody.cycle_end_date ? new Date(reqBody.cycle_end_date) : existingMacrocycle.cycle_end_date;
		if (!isValidDate(nextStartDate) || !isValidDate(nextEndDate) || nextStartDate > nextEndDate) {
			return res.status(400).json({ error: 'Start must be before end date' });
		}

		await prisma.$transaction(async (tx) => {
			await tx.macrocycle.update({
				where: { id: macrocycleId },
				data: {
					...(reqBody.cycle_name !== undefined ? { cycle_name: reqBody.cycle_name ?? null } : {}),
					...(reqBody.cycle_start_date !== undefined ? { cycle_start_date: nextStartDate } : {}),
					...(reqBody.cycle_end_date !== undefined ? { cycle_end_date: nextEndDate } : {}),
					...(reqBody.is_active !== undefined ? { is_active: reqBody.is_active } : {}),
					...(reqBody.notes !== undefined ? { notes: reqBody.notes ?? null } : {}),
				},
			});

			if (reqBody.is_active === true) {
				await tx.macrocycle.updateMany({
					where: {
						id: { not: macrocycleId },
						client_id: existingMacrocycle.client_id,
						is_active: true,
						cycle_end_date: { gte: nextStartDate },
						cycle_start_date: { lte: nextEndDate },
					},
					data: { is_active: false },
				});
			}
		});

		res.status(204).send();
	} catch (error) {
		console.error('Error updating macrocycle:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const handleDeleteMacrocycle = async (req: Request<{ id: string }>, res: Response) => {
	try {
		const macrocycleId = parseInt(req.params.id, 10);
		if (isNaN(macrocycleId)) {
			return res.status(400).json({ error: 'Invalid macrocycle ID' });
		}

		await prisma.macrocycle.delete({ where: { id: macrocycleId } });
		res.status(200).json({ message: 'Macrocycle deleted successfully' });
	} catch (error) {
		console.error('Error deleting macrocycle:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const handleGetMesocycle = async (
	req: Request<{ clientId: string }, {}, {}, MesocycleSearchParams>,
	res: Response<ResponseWithError<Mesocycle[]>>
) => {
	try {
		const clientId = parseInt(req.params.clientId, 10);
		if (isNaN(clientId)) {
			return res.status(400).json({ hasError: true, errorMessage: 'Invalid client ID' });
		}
		const { active, date, macrocycleId } = req.query;
		const filterDate = parseDateIfPresent(date);

		const macrocycleIdNumber = parseInt(macrocycleId ?? '', 10);
		const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;

		const mesocyclesResult = await prisma.mesocycle.findMany({
			where: {
				client_id: clientId,
				...(!isNaN(macrocycleIdNumber) ? { macrocycle_id: macrocycleIdNumber } : {}),
				...(activeBool !== undefined ? { is_active: activeBool } : {}),
				...(filterDate
					? {
							cycle_start_date: { lte: filterDate },
							cycle_end_date: { gte: filterDate },
						}
					: {}),
			},
			orderBy: { cycle_start_date: 'desc' },
		});

		if (mesocyclesResult.length === 0) {
			return res.status(200).json([]);
		}

		const mesocycles: Mesocycle[] = mesocyclesResult.map((row) => ({
			id: row.id,
			client_id: row.client_id,
			cycle_name: row.cycle_name ?? undefined,
			macrocycle_id: row.macrocycle_id,
			cycle_start_date: dayjs.utc(row.cycle_start_date).format('YYYY-MM-DD'),
			cycle_end_date: dayjs.utc(row.cycle_end_date).format('YYYY-MM-DD'),
			opt_levels: row.opt_levels ? row.opt_levels.split(',').map((level) => parseInt(level, 10)) : undefined,
			cardio_levels: row.cardio_levels ? row.cardio_levels.split(',').map((level) => parseInt(level, 10)) : undefined,
			notes: row.notes ?? undefined,
			is_active: row.is_active,
			created_at: dayjs.utc(row.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(row.updated_at).format('YYYY-MM-DD'),
		}));

		res.status(200).json(mesocycles);
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error fetching mesocycle:', error);
		res.status(500).json({ hasError: true, errorMessage });
	}
};

export const handleCreateMesocycle = async (req: Request<{}, {}, Omit<Mesocycle, 'id' | 'client_id'>>, res: Response) => {
	try {
		const reqBody = req.body;
		if (!reqBody.macrocycle_id || !reqBody.cycle_start_date || !reqBody.cycle_end_date) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const cycleStartDate = new Date(reqBody.cycle_start_date);
		const cycleEndDate = new Date(reqBody.cycle_end_date);
		if (!isValidDate(cycleStartDate) || !isValidDate(cycleEndDate) || cycleStartDate > cycleEndDate) {
			return res.status(400).json({ error: 'Start date must be before end date' });
		}

		const parentMacrocycle = await prisma.macrocycle.findUnique({
			where: { id: reqBody.macrocycle_id },
			select: { client_id: true, cycle_start_date: true, cycle_end_date: true },
		});
		if (!parentMacrocycle) {
			return res.status(404).json({ error: 'Macrocycle not found' });
		}

		if (cycleStartDate < parentMacrocycle.cycle_start_date || cycleEndDate > parentMacrocycle.cycle_end_date) {
			return res.status(400).json({ error: 'Mesocycle dates must be within macrocycle dates' });
		}

		const shouldDeactivateOverlaps = reqBody.is_active !== false;
		const newMesocycle = await prisma.$transaction(async (tx) => {
			if (shouldDeactivateOverlaps) {
				await tx.mesocycle.updateMany({
					where: {
						macrocycle_id: reqBody.macrocycle_id,
						is_active: true,
						cycle_end_date: { gte: cycleStartDate },
						cycle_start_date: { lte: cycleEndDate },
					},
					data: { is_active: false },
				});
			}

			return tx.mesocycle.create({
				data: {
					client_id: parentMacrocycle.client_id,
					cycle_name: reqBody.cycle_name ?? null,
					macrocycle_id: reqBody.macrocycle_id,
					cycle_start_date: cycleStartDate,
					cycle_end_date: cycleEndDate,
					opt_levels: reqBody.opt_levels ? reqBody.opt_levels.join(',') : null,
					cardio_levels: reqBody.cardio_levels ? reqBody.cardio_levels.join(',') : null,
					notes: reqBody.notes ?? null,
					is_active: reqBody.is_active ?? true,
				},
				select: { id: true },
			});
		});

		res.status(201).json({ mesocycleId: newMesocycle.id });
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error creating mesocycle:', error);
		res.status(500).json({ error: errorMessage });
	}
};

export const handleUpdateMesocycle = async (req: Request<{ id: string }, {}, MesocycleUpdateRequest>, res: Response) => {
	try {
		const mesocycleId = parseInt(req.params.id, 10);
		if (isNaN(mesocycleId)) {
			return res.status(400).json({ error: 'Invalid mesocycle ID' });
		}

		const reqBody = req.body;
		const existingMesocycle = await prisma.mesocycle.findUnique({
			where: { id: mesocycleId },
			include: { Macrocycle: { select: { cycle_start_date: true, cycle_end_date: true } } },
		});
		if (!existingMesocycle) {
			return res.status(404).json({ error: 'Mesocycle not found' });
		}

		if (reqBody.cycle_start_date) {
			const requestedStartDate = new Date(reqBody.cycle_start_date);
			if (!isValidDate(requestedStartDate) || requestedStartDate < existingMesocycle.Macrocycle.cycle_start_date) {
				return res.status(400).json({ error: 'Mesocycle dates must be within macrocycle dates' });
			}
		}

		if (reqBody.cycle_end_date) {
			const requestedEndDate = new Date(reqBody.cycle_end_date);
			if (!isValidDate(requestedEndDate) || requestedEndDate > existingMesocycle.Macrocycle.cycle_end_date) {
				return res.status(400).json({ error: 'Mesocycle dates must be within macrocycle dates' });
			}
		}

		const nextStartDate = reqBody.cycle_start_date ? new Date(reqBody.cycle_start_date) : existingMesocycle.cycle_start_date;
		const nextEndDate = reqBody.cycle_end_date ? new Date(reqBody.cycle_end_date) : existingMesocycle.cycle_end_date;
		if (!isValidDate(nextStartDate) || !isValidDate(nextEndDate) || nextStartDate > nextEndDate) {
			return res.status(400).json({ error: 'Start must be before end date' });
		}

		await prisma.$transaction(async (tx) => {
			await tx.mesocycle.update({
				where: { id: mesocycleId },
				data: {
					...(reqBody.cycle_name !== undefined ? { cycle_name: reqBody.cycle_name ?? null } : {}),
					...(reqBody.cycle_start_date !== undefined ? { cycle_start_date: nextStartDate } : {}),
					...(reqBody.cycle_end_date !== undefined ? { cycle_end_date: nextEndDate } : {}),
					...(reqBody.opt_levels !== undefined
						? { opt_levels: reqBody.opt_levels ? reqBody.opt_levels.join(',') : null }
						: {}),
					...(reqBody.cardio_levels !== undefined
						? { cardio_levels: reqBody.cardio_levels ? reqBody.cardio_levels.join(',') : null }
						: {}),
					...(reqBody.notes !== undefined ? { notes: reqBody.notes ?? null } : {}),
					...(reqBody.is_active !== undefined ? { is_active: reqBody.is_active } : {}),
				},
			});

			if (reqBody.is_active === true) {
				await tx.mesocycle.updateMany({
					where: {
						id: { not: mesocycleId },
						macrocycle_id: existingMesocycle.macrocycle_id,
						is_active: true,
						cycle_end_date: { gte: nextStartDate },
						cycle_start_date: { lte: nextEndDate },
					},
					data: { is_active: false },
				});
			}
		});

		res.status(204).send();
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error updating mesocycle:', error);
		res.status(500).json({ error: errorMessage });
	}
};

export const handleDeleteMesocycle = async (req: Request<{ id: string }>, res: Response) => {
	try {
		const mesocycleId = parseInt(req.params.id, 10);
		if (isNaN(mesocycleId)) {
			return res.status(400).json({ error: 'Invalid mesocycle ID' });
		}

		await prisma.mesocycle.delete({ where: { id: mesocycleId } });
		res.status(200).json({ message: 'Mesocycle deleted successfully' });
	} catch (error) {
		console.error('Error deleting mesocycle:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const handleGetMicrocycle = async (req: Request<{ id: string }, {}, {}, MicrocycleSearchParams>, res: Response) => {
	try {
		const cycleId = parseInt(req.params.id, 10);
		const { active, date, mesocycleId, clientId } = req.query;
		const filterDate = parseDateIfPresent(date);

		const mesocycleIdNumber = parseInt(mesocycleId ?? '', 10);
		const clientIdNumber = parseInt(clientId ?? '', 10);
		const activeBool = active === 'true' ? true : active === 'false' ? false : undefined;

		const microcyclesResult = await prisma.microcycle.findMany({
			where: {
				...(!isNaN(cycleId) ? { id: cycleId } : {}),
				...(!isNaN(clientIdNumber) ? { client_id: clientIdNumber } : {}),
				...(!isNaN(mesocycleIdNumber) ? { mesocycle_id: mesocycleIdNumber } : {}),
				...(activeBool !== undefined ? { is_active: activeBool } : {}),
				...(filterDate
					? {
							cycle_start_date: { lte: filterDate },
							cycle_end_date: { gte: filterDate },
						}
					: {}),
			},
			orderBy: { cycle_start_date: 'desc' },
		});

		if (microcyclesResult.length === 0) {
			return res.status(200).json([]);
		}

		const microcycles: Microcycle[] = microcyclesResult.map((row) => ({
			id: row.id,
			client_id: row.client_id,
			mesocycle_id: row.mesocycle_id,
			cycle_name: row.cycle_name ?? undefined,
			cycle_start_date: dayjs.utc(row.cycle_start_date).format('YYYY-MM-DD'),
			cycle_end_date: dayjs.utc(row.cycle_end_date).format('YYYY-MM-DD'),
			notes: row.notes ?? undefined,
			is_active: row.is_active,
			created_at: dayjs.utc(row.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(row.updated_at).format('YYYY-MM-DD'),
		}));

		res.status(200).json(microcycles);
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error fetching microcycle:', error);
		res.status(500).json({ error: errorMessage });
	}
};

export const handleCreateMicrocycle = async (req: Request<{}, {}, Omit<Microcycle, 'id' | 'client_id'>>, res: Response) => {
	try {
		const reqBody = req.body;
		if (!reqBody.mesocycle_id || !reqBody.cycle_start_date || !reqBody.cycle_end_date) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		const cycleStartDate = new Date(reqBody.cycle_start_date);
		const cycleEndDate = new Date(reqBody.cycle_end_date);
		if (!isValidDate(cycleStartDate) || !isValidDate(cycleEndDate) || cycleStartDate > cycleEndDate) {
			return res.status(400).json({ error: 'Start date must be before end date' });
		}

		const parentMesocycle = await prisma.mesocycle.findUnique({
			where: { id: reqBody.mesocycle_id },
			select: { client_id: true, cycle_start_date: true, cycle_end_date: true },
		});
		if (!parentMesocycle) {
			return res.status(404).json({ error: 'Mesocycle not found' });
		}

		if (cycleStartDate < parentMesocycle.cycle_start_date || cycleEndDate > parentMesocycle.cycle_end_date) {
			return res.status(400).json({ error: 'Microcycle dates must be within mesocycle dates' });
		}

		const shouldDeactivateOverlaps = reqBody.is_active !== false;
		const newMicrocycle = await prisma.$transaction(async (tx) => {
			if (shouldDeactivateOverlaps) {
				await tx.microcycle.updateMany({
					where: {
						mesocycle_id: reqBody.mesocycle_id,
						is_active: true,
						cycle_end_date: { gte: cycleStartDate },
						cycle_start_date: { lte: cycleEndDate },
					},
					data: { is_active: false },
				});
			}

			return tx.microcycle.create({
				data: {
					mesocycle_id: reqBody.mesocycle_id,
					client_id: parentMesocycle.client_id,
					cycle_name: reqBody.cycle_name ?? null,
					cycle_start_date: cycleStartDate,
					cycle_end_date: cycleEndDate,
					notes: reqBody.notes ?? null,
					is_active: reqBody.is_active ?? true,
				},
				select: { id: true },
			});
		});

		res.status(201).json({ microcycleId: newMicrocycle.id });
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error creating microcycle:', error);
		res.status(500).json({ error: errorMessage });
	}
};

export const handleUpdateMicrocycle = async (req: Request<{ id: string }, {}, MicrocycleUpdateRequest>, res: Response) => {
	try {
		const microcycleId = parseInt(req.params.id, 10);
		if (isNaN(microcycleId)) {
			return res.status(400).json({ error: 'Invalid microcycle ID' });
		}

		const reqBody = req.body;
		const existingMicrocycle = await prisma.microcycle.findUnique({
			where: { id: microcycleId },
			include: { Mesocycle: { select: { cycle_start_date: true, cycle_end_date: true } } },
		});
		if (!existingMicrocycle) {
			return res.status(404).json({ error: 'Microcycle not found' });
		}

		if (reqBody.cycle_start_date) {
			const requestedStartDate = new Date(reqBody.cycle_start_date);
			if (!isValidDate(requestedStartDate) || requestedStartDate < existingMicrocycle.Mesocycle.cycle_start_date) {
				return res.status(400).json({ error: 'Microcycle dates must be within mesocycle dates' });
			}
		}

		if (reqBody.cycle_end_date) {
			const requestedEndDate = new Date(reqBody.cycle_end_date);
			if (!isValidDate(requestedEndDate) || requestedEndDate > existingMicrocycle.Mesocycle.cycle_end_date) {
				return res.status(400).json({ error: 'Microcycle dates must be within mesocycle dates' });
			}
		}

		const nextStartDate = reqBody.cycle_start_date ? new Date(reqBody.cycle_start_date) : existingMicrocycle.cycle_start_date;
		const nextEndDate = reqBody.cycle_end_date ? new Date(reqBody.cycle_end_date) : existingMicrocycle.cycle_end_date;
		if (!isValidDate(nextStartDate) || !isValidDate(nextEndDate) || nextStartDate > nextEndDate) {
			return res.status(400).json({ error: 'Start must be before end date' });
		}

		await prisma.$transaction(async (tx) => {
			await tx.microcycle.update({
				where: { id: microcycleId },
				data: {
					...(reqBody.cycle_name !== undefined ? { cycle_name: reqBody.cycle_name ?? null } : {}),
					...(reqBody.cycle_start_date !== undefined ? { cycle_start_date: nextStartDate } : {}),
					...(reqBody.cycle_end_date !== undefined ? { cycle_end_date: nextEndDate } : {}),
					...(reqBody.notes !== undefined ? { notes: reqBody.notes ?? null } : {}),
					...(reqBody.is_active !== undefined ? { is_active: reqBody.is_active } : {}),
				},
			});

			if (reqBody.is_active === true) {
				await tx.microcycle.updateMany({
					where: {
						id: { not: microcycleId },
						mesocycle_id: existingMicrocycle.mesocycle_id,
						is_active: true,
						cycle_end_date: { gte: nextStartDate },
						cycle_start_date: { lte: nextEndDate },
					},
					data: { is_active: false },
				});
			}
		});

		res.status(204).send();
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error updating microcycle:', error);
		res.status(500).json({ error: errorMessage });
	}
};

export const handleUpdateMicrocycleRoutines = async (
	req: Request<{ id: string }, {}, MicrocycleUpdateRoutinesRequest>,
	res: Response
) => {
	try {
		const microcycleId = parseInt(req.params.id, 10);
		if (isNaN(microcycleId)) {
			return res.status(400).json({ error: 'Invalid microcycle ID' });
		}

		const reqBody = req.body;

		const createRoutineBodies = reqBody.routines.map(
			(routine, index): CreateWorkoutRoutine => ({
				microcycle_id: microcycleId,
				routine_index: index,
				routine_name: routine.routine_name,
				isActive: true,
				exercise_groups: routine.exercise_groups,
			})
		);
		await deactivateCycleRoutines(microcycleId);
		const results = [];
		for (const routine of createRoutineBodies) {
			const result = await createWorkoutRoutine(routine);
			results.push(result);
		}

		if (results.some((result) => result === undefined)) {
			console.error('Failed to create one or more workout routines:', 'Failed to create one or more workout routines.');
			res.status(500).json({ message: 'Failed to create workout routines.' });
			return;
		}

		res.status(204).send();
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error updating microcycle routines:', error);
		res.status(500).json({ error: errorMessage });
	}
};

export const handleDeleteMicrocycle = async (req: Request<{ id: string }>, res: Response) => {
	try {
		const microcycleId = parseInt(req.params.id, 10);
		if (isNaN(microcycleId)) {
			return res.status(400).json({ error: 'Invalid microcycle ID' });
		}

		await prisma.microcycle.delete({ where: { id: microcycleId } });
		res.status(200).json({ message: 'Microcycle deleted successfully' });
	} catch (error: unknown) {
		let errorMessage = 'Internal server error';
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error('Error deleting microcycle:', error);
		res.status(500).json({ error: errorMessage });
	}
};
