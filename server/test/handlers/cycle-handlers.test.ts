import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGetTrainingPlanTodos } from '../../api/handlers/cycle-handlers';
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

describe('handleGetTrainingPlanTodos', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 when trainerId query param is missing', async () => {
		const req = createMockRequest();
		const res = createMockResponse();

		await handleGetTrainingPlanTodos(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: 'trainerId is required' });
	});

	it('returns 400 when trainerId is not a positive integer', async () => {
		for (const invalid of ['0', '-5', 'abc', '1.5']) {
			vi.clearAllMocks();

			const req = createMockRequest({ trainerId: invalid });
			const res = createMockResponse();

			await handleGetTrainingPlanTodos(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: 'trainerId must be a positive integer' });
		}
	});

	it('returns mapped ClientTrainingPlanTodo array on success', async () => {
		vi.mocked(prisma.client.findMany).mockResolvedValue([
			{
				id: 1,
				trainerId: 10,
				Contact: { first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com', phone: '555-0001' },
			},
			{
				id: 2,
				trainerId: 10,
				Contact: { first_name: 'Grace', last_name: 'Hopper', email: 'grace@example.com', phone: '555-0002' },
			},
		] as never);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetTrainingPlanTodos(req, res);

		expect(prisma.client.findMany).toHaveBeenCalledWith({
			where: {
				trainerId: 10,
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
		expect(res.json).toHaveBeenCalledWith([
			{ clientId: 1, first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com', phone: '555-0001', trainerId: 10 },
			{
				clientId: 2,
				first_name: 'Grace',
				last_name: 'Hopper',
				email: 'grace@example.com',
				phone: '555-0002',
				trainerId: 10,
			},
		]);
	});

	it('returns an empty array when no clients are returned from DB', async () => {
		vi.mocked(prisma.client.findMany).mockResolvedValue([] as never);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetTrainingPlanTodos(req, res);

		expect(res.json).toHaveBeenCalledWith([]);
	});

	it('returns 500 when the database query throws', async () => {
		vi.mocked(prisma.client.findMany).mockRejectedValue(new Error('DB connection failed'));

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetTrainingPlanTodos(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
	});

	it('does not query prisma when validation returns early', async () => {
		const req = createMockRequest(); // missing trainerId
		const res = createMockResponse();

		await handleGetTrainingPlanTodos(req, res);

		expect(prisma.client.findMany).not.toHaveBeenCalled();
	});
});
