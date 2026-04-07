import type { Request, Response } from 'express';
import type { Connection } from 'mysql2/promise';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGetDietLogTodos } from '../../api/handlers/diet-handlers';
import { closeDatabaseConnection, getDatabaseConnection } from '../../database/mysql-database';

// Mock the DB module so no real connection is made
vi.mock('../../infrastructure/mysql-database', () => ({
	getDatabaseConnection: vi.fn(),
	closeDatabaseConnection: vi.fn(),
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

function createMockConnection(rows: object[][] = [[]]) {
	return {
		query: vi.fn().mockResolvedValue([rows]),
	} as unknown as Connection;
}

describe('handleGetDietLogTodos', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns 400 when trainerId query param is missing', async () => {
		vi.mocked(getDatabaseConnection).mockResolvedValue(createMockConnection());

		const req = createMockRequest();
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: 'trainerId is required' });
	});

	it('returns 400 when trainerId is not a positive integer', async () => {
		for (const invalid of ['0', '-5', 'abc', '1.5']) {
			vi.clearAllMocks();
			vi.mocked(getDatabaseConnection).mockResolvedValue(createMockConnection());

			const req = createMockRequest({ trainerId: invalid });
			const res = createMockResponse();

			await handleGetDietLogTodos(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ message: 'trainerId must be a positive integer' });
		}
	});

	it('returns mapped ClientDietLogTodo array on success', async () => {
		const dbRows = [
			{
				ClientId: 1,
				first_name: 'Ada',
				last_name: 'Lovelace',
				email: 'ada@example.com',
				phone: '555-0001',
				trainerId: 10,
				lastLogDate: '2026-04-05',
			},
			{
				ClientId: 2,
				first_name: 'Grace',
				last_name: 'Hopper',
				email: 'grace@example.com',
				phone: '555-0002',
				trainerId: 10,
				lastLogDate: '2026-04-03',
			},
		];
		const mockConnection = createMockConnection([dbRows]);
		vi.mocked(getDatabaseConnection).mockResolvedValue(mockConnection);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(mockConnection.query).toHaveBeenCalledWith({
			sql: 'CALL spGetDietLogTodosByTrainer(?)',
			values: [10],
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
		expect(closeDatabaseConnection).toHaveBeenCalledWith(mockConnection);
	});

	it('maps null lastLogDate to undefined', async () => {
		const dbRows = [
			{
				ClientId: 3,
				first_name: 'Alan',
				last_name: 'Turing',
				email: 'alan@example.com',
				phone: '555-0003',
				trainerId: 10,
				lastLogDate: null,
			},
		];
		const mockConnection = createMockConnection([dbRows]);
		vi.mocked(getDatabaseConnection).mockResolvedValue(mockConnection);

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
		const mockConnection = createMockConnection([[]]);
		vi.mocked(getDatabaseConnection).mockResolvedValue(mockConnection);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(res.json).toHaveBeenCalledWith([]);
	});

	it('returns 500 when the database query throws', async () => {
		const mockConnection = {
			query: vi.fn().mockRejectedValue(new Error('DB connection failed')),
		} as unknown as Connection;
		vi.mocked(getDatabaseConnection).mockResolvedValue(mockConnection);

		const req = createMockRequest({ trainerId: '10' });
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
		expect(closeDatabaseConnection).toHaveBeenCalledWith(mockConnection);
	});

	it('closes the DB connection even when validation returns early', async () => {
		const mockConnection = createMockConnection();
		vi.mocked(getDatabaseConnection).mockResolvedValue(mockConnection);

		const req = createMockRequest(); // missing trainerId
		const res = createMockResponse();

		await handleGetDietLogTodos(req, res);

		expect(closeDatabaseConnection).toHaveBeenCalledWith(mockConnection);
	});
});
