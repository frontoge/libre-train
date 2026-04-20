import {
	AddClientFormValues,
	ClientContact,
	DailyUpdateRequest,
	DashboardData,
	DashboardResponse,
	DashboardSummaryQuery,
	DashboardWeeklySummaryResponse,
	undefinedIfNull,
	UpdateClientRequest,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';
import { MessageResponse } from '../../types/utilities';

const numberOrUndefined = (value: unknown): number | undefined => {
	if (value === null || value === undefined) return undefined;
	if (typeof value === 'number') return value;

	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
};

const numberOrZero = (value: unknown): number => numberOrUndefined(value) ?? 0;

export const handleGetClientContacts = async (
	req: Request<{ id?: string }>,
	res: Response<ClientContact[] | MessageResponse>
) => {
	const { id } = req.params;

	try {
		const contacts = id
			? await prisma.clientContact.findMany({
					where: { ClientId: parseInt(id, 10) },
					orderBy: { ClientId: 'asc' },
				})
			: await prisma.clientContact.findMany({ orderBy: { ClientId: 'asc' } });

		const mappedContacts: ClientContact[] = contacts.map((contact) => ({
			...contact,
			height: undefinedIfNull(contact.height),
			phone: undefinedIfNull(contact.phone),
			img: undefinedIfNull(contact.img),
			notes: undefinedIfNull(contact.notes),
			date_of_birth: contact.date_of_birth ? dayjs.utc(contact.date_of_birth).format('YYYY-MM-DD') : undefined,
		}));

		res.status(200).json(mappedContacts);
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error fetching client contacts:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error fetching client contacts:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};

// This should not all be handled on this endpoint. This should only take a contact ID and client create data
// TODO: Fix this
export const handleCreateClient = async (req: Request<{}, {}, AddClientFormValues>, res: Response<MessageResponse>) => {
	if (!req.body) {
		res.status(400).json({ message: 'Request body is required' });
		return;
	}

	const body = req.body;

	try {
		// Create contact in database
		const contact = await prisma.contact.create({
			data: {
				first_name: body.firstName ?? 'Unknown',
				last_name: body.lastName ?? 'Unknown',
				email: body.email ?? 'unknown@unknown.com',
				phone: body.phoneNumber ?? null,
				date_of_birth: body.dob ? new Date(body.dob) : null,
				img: body.img64 ?? null,
			},
		});

		if (!contact?.id) {
			console.error('Failed to create client:', 'Failed to create contact.');
			res.status(500).json({ message: 'Failed to create client.' });
			return;
		}

		// Create client linked to contact
		const client = await prisma.client.create({
			data: {
				contactId: contact.id,
				trainerId: body.trainerId,
				height: body.height ?? null,
				notes: body.notes ?? null,
			},
		});

		if (!client?.id) {
			console.error('Failed to create client:', 'Failed to create client.');
			res.status(500).json({ message: 'Failed to create client.' });
			return;
		}

		// Gonna need this in the create client daily log handler. have to check if it is already there
		// let d = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));

		res.status(201).json({ message: 'Client created successfully.' });
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error creating client:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error creating client:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};

export const handleDailyUpdate = async (req: Request<{}, {}, DailyUpdateRequest>, res: Response<MessageResponse>) => {
	if (!req.body) {
		res.status(400).json({ message: 'Request body is required' });
		return;
	}

	const { date, data } = req.body;
	try {
		const logDate = new Date(date);
		// Set the date to start of day for consistent matching
		const startOfDay = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());

		// Use upsert to handle insert or update
		await prisma.clientDailyLog.upsert({
			where: {
				client_id_created_at: {
					client_id: req.body.clientId,
					created_at: startOfDay,
				},
			},
			update: {
				logged_weight: data.weight ?? undefined,
				body_fat: data.body_fat ?? undefined,
				logged_calories: data.calories ?? undefined,
				target_calories: data.target_calories ?? undefined,
				logged_protein: data.protein ?? undefined,
				target_protein: data.target_protein ?? undefined,
				logged_carbs: data.carbs ?? undefined,
				target_carbs: data.target_carbs ?? undefined,
				logged_fat: data.fats ?? undefined,
				target_fat: data.target_fats ?? undefined,
			},
			create: {
				client_id: req.body.clientId,
				created_at: startOfDay,
				logged_weight: data.weight ?? null,
				body_fat: data.body_fat ?? null,
				logged_calories: data.calories ?? null,
				target_calories: data.target_calories ?? null,
				logged_protein: data.protein ?? null,
				target_protein: data.target_protein ?? null,
				logged_carbs: data.carbs ?? null,
				target_carbs: data.target_carbs ?? null,
				logged_fat: data.fats ?? null,
				target_fat: data.target_fats ?? null,
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error submitting daily update:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error submitting daily update:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}

	res.status(200).json({ message: 'Daily update submitted successfully.' });
};

export const handleGetDashboard = async (
	req: Request<{}, {}, {}, { clientId: string; date: string }>,
	res: Response<DashboardResponse>
) => {
	const { clientId, date } = req.query;

	if (!clientId || !date) {
		res.status(400).json({ message: 'Client ID and date are required.' });
		return;
	}
	try {
		const parsedClientId = parseInt(clientId, 10);
		const parsedDate = new Date(date);
		const startOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());

		// Fetch client with contact
		const client = await prisma.client.findUnique({
			where: { id: parsedClientId },
			include: { Contact: true },
		});

		if (!client) {
			res.status(200).json({ message: 'no data found' });
			return;
		}

		// Fetch daily log for the specified date
		const dailyLog = await prisma.clientDailyLog.findFirst({
			where: {
				client_id: parsedClientId,
				created_at: startOfDay,
			},
		});

		const dashboardData: DashboardData = {
			clientId: client.id,
			first_name: client.Contact?.first_name ?? 'Unknown',
			last_name: client.Contact?.last_name ?? 'Unknown',
			email: client.Contact?.email ?? 'unknown@unknown.com',
			phone: client.Contact?.phone ?? '',
			height: client.height ?? undefined,
			img: client.Contact?.img ?? undefined,
			logged_weight: numberOrZero(dailyLog?.logged_weight),
			logged_calories: numberOrUndefined(dailyLog?.logged_calories),
			logged_body_fat: numberOrUndefined(dailyLog?.body_fat),
			logged_protein: numberOrUndefined(dailyLog?.logged_protein),
			logged_carbs: numberOrUndefined(dailyLog?.logged_carbs),
			logged_fats: numberOrUndefined(dailyLog?.logged_fat),
			target_calories: numberOrUndefined(dailyLog?.target_calories),
			target_protein: numberOrUndefined(dailyLog?.target_protein),
			target_carbs: numberOrUndefined(dailyLog?.target_carbs),
			target_fats: numberOrUndefined(dailyLog?.target_fat),
		};

		res.status(200).json(dashboardData);
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error fetching dashboard data:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error fetching dashboard data:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};

export const handleGetDashboardSummary = async (
	req: Request<{}, {}, {}, DashboardSummaryQuery>,
	res: Response<DashboardWeeklySummaryResponse>
) => {
	const { clientId, startDate, endDate } = req.query;

	if (!clientId || !startDate || !endDate) {
		res.status(400).json({ message: 'Client ID, start date, and end date are required.' });
		return;
	}
	try {
		const parsedClientId = parseInt(clientId, 10);
		const startDateObj = new Date(startDate);
		const endDateObj = new Date(endDate);

		const dailyLogs = await prisma.clientDailyLog.findMany({
			where: {
				client_id: parsedClientId,
				created_at: {
					gte: startDateObj,
					lte: endDateObj,
				},
			},
			orderBy: { created_at: 'asc' },
		});

		if (dailyLogs.length === 0) {
			res.status(200).json({ message: 'No data found for the specified date range.' });
			return;
		}

		const logCount = dailyLogs.length;
		const summary = {
			avg_weight: dailyLogs.reduce((sum, log) => sum + numberOrZero(log.logged_weight), 0) / logCount,
			avg_bodyfat: dailyLogs.reduce((sum, log) => sum + numberOrZero(log.body_fat), 0) / logCount,
			avg_calories: dailyLogs.reduce((sum, log) => sum + numberOrZero(log.logged_calories), 0) / logCount,
			total_macros: dailyLogs.reduce(
				(sum, log) =>
					sum + numberOrZero(log.logged_protein) + numberOrZero(log.logged_carbs) + numberOrZero(log.logged_fat),
				0
			),
			target_macros: dailyLogs.reduce(
				(sum, log) =>
					sum + numberOrZero(log.target_protein) + numberOrZero(log.target_carbs) + numberOrZero(log.target_fat),
				0
			),
		};

		res.status(200).json([summary]);
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error fetching dashboard weekly summary:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error fetching dashboard weekly summary:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};

export const handleDeleteClient = async (req: Request<{ id: string }>, res: Response<void | MessageResponse>) => {
	const { id } = req.params;

	try {
		await prisma.client.delete({ where: { id: parseInt(id, 10) } });

		res.status(204).send();
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error deleting client:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error deleting client:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};

export const handleUpdateClient = async (
	req: Request<{ id: string }, {}, UpdateClientRequest>,
	res: Response<undefined | MessageResponse>
) => {
	try {
		const { id } = req.params;
		const { height, notes, trainerId } = req.body;

		if (id === undefined) {
			res.status(400).json({ message: 'Client ID is required.' });
			return;
		}

		await prisma.client.update({
			where: { id: parseInt(id, 10) },
			data: {
				height: height ?? undefined,
				notes: notes ?? undefined,
				trainerId: trainerId ?? undefined,
			},
		});

		res.status(204).send();
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error updating client:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error updating client:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};
