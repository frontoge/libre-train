import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGetDietLogTodos } from '../../api/handlers/diet-handlers';
import { prisma } from '../../database/mysql-database';

// Mock the DB module so no real database call is made
vi.mock('../../database/mysql-database', () => ({
	prisma: {
		client: {
			findMany: vi.fn(),
		},
	},
}));

function createMockResponse() {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
}

function createMockRequest(query: Record<string, string> = {}): Request<{}, {}, {}, { trainerId?: string }> {
	return { query } as unknown as Request<{}, {}, {}, { trainerId?: string }>;
}

describe('handleGetDietLogTodos', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 when trainerId query param is missing', async () => {
		const req = createMockRequest();
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: 'trainerId is required' });
	});

	it('returns 400 when trainerId is not a positive integer', async () => {
		for (const invalid of ['0', '-5', 'abc', '1.5']) {
			vi.clearAllMocks();

			const req = createMockRequest({ trainerId: invalid });
			const res = createMockResponse();

			await handleGetDietLogTodos(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: 'trainerId must be a positive integer' });
		}
	});

	it('returns mapped ClientDietLogTodo array on success', async () => {
		vi.mocked(prisma.client.findMany).mockResolvedValue([
			{
				id: 1,
				trainerId: 10,
				Contact: {
					first_name: 'Ada',
					last_name: 'Lovelace',
					email: 'ada@example.com',
					phone: '555-0001',
				},
				DietPlanLogEntry: [{ logDate: new Date('2026-04-05T00:00:00.000Z') }],
			},
			{
				id: 2,
				trainerId: 10,
				Contact: {
					first_name: 'Grace',
					last_name: 'Hopper',
					email: 'grace@example.com',
					phone: '555-0002',
				},
				DietPlanLogEntry: [{ logDate: new Date('2026-04-03T00:00:00.000Z') }],
			},
		] as never);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		const expectedToday = new Date();
		expectedToday.setHours(0, 0, 0, 0);

		expect(prisma.client.findMany).toHaveBeenCalledWith({
			where: {
				trainerId: 10,
				DietPlan: { some: { isActive: true } },
				NOT: {
					DietPlan: {
						some: {
							isActive: true,
							DietPlanLogEntry: {
								some: { logDate: expectedToday },
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
		expect(res.json).toHaveBeenCalledWith([
			{
				clientId: 1,
				first_name: 'Ada',
				last_name: 'Lovelace',
				email: 'ada@example.com',
				phone: '555-0001',
				trainerId: 10,
				lastLogDate: '2026-04-05',
			},
			{
				clientId: 2,
				first_name: 'Grace',
				last_name: 'Hopper',
				email: 'grace@example.com',
				phone: '555-0002',
				trainerId: 10,
				lastLogDate: '2026-04-03',
			},
		]);
	});

	it('maps null lastLogDate to undefined', async () => {
		vi.mocked(prisma.client.findMany).mockResolvedValue([
			{
				id: 3,
				trainerId: 10,
				Contact: {
					first_name: 'Alan',
					last_name: 'Turing',
					email: 'alan@example.com',
					phone: '555-0003',
				},
				DietPlanLogEntry: [],
			},
		] as never);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(res.json).toHaveBeenCalledWith([
			{
				clientId: 3,
				first_name: 'Alan',
				last_name: 'Turing',
				email: 'alan@example.com',
				phone: '555-0003',
				trainerId: 10,
				lastLogDate: undefined,
			},
		]);
	});

	it('returns an empty array when no clients are returned from DB', async () => {
		vi.mocked(prisma.client.findMany).mockResolvedValue([] as never);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(res.json).toHaveBeenCalledWith([]);
	});

	it('returns 500 when the database query throws', async () => {
		vi.mocked(prisma.client.findMany).mockRejectedValue(new Error('DB connection failed'));

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
	});

	it('does not query prisma when validation returns early', async () => {
		const req = createMockRequest(); // missing trainerId
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(prisma.client.findMany).not.toHaveBeenCalled();
	});
});
