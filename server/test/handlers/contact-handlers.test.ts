import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleGetContacts } from '../../api/handlers/contact-handlers';
import { prisma } from '../../database/mysql-database';

vi.mock('../../database/mysql-database', () => ({
	prisma: {
		contact: {
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

describe('handleGetContacts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps Contact rows to ContactWithFlags using _count for trainer/client flags', async () => {
		vi.mocked(prisma.contact.findMany).mockResolvedValue([
			{
				id: 1,
				first_name: 'Ada',
				last_name: 'Lovelace',
				email: 'ada@example.com',
				phone: '555-0001',
				date_of_birth: new Date('1990-01-15T00:00:00Z'),
				img: null,
				created_at: new Date('2026-01-01T00:00:00Z'),
				updated_at: new Date('2026-01-01T00:00:00Z'),
				_count: { Client: 0, User: 1 },
			},
			{
				id: 2,
				first_name: 'Grace',
				last_name: 'Hopper',
				email: 'grace@example.com',
				phone: null,
				date_of_birth: null,
				img: null,
				created_at: new Date('2026-01-01T00:00:00Z'),
				updated_at: new Date('2026-01-01T00:00:00Z'),
				_count: { Client: 1, User: 0 },
			},
			{
				id: 3,
				first_name: 'Lead',
				last_name: 'Person',
				email: 'lead@example.com',
				phone: null,
				date_of_birth: null,
				img: null,
				created_at: new Date('2026-01-01T00:00:00Z'),
				updated_at: new Date('2026-01-01T00:00:00Z'),
				_count: { Client: 0, User: 0 },
			},
		] as never);

		const res = createMockResponse();
		await handleGetContacts({} as Request, res);

		expect(prisma.contact.findMany).toHaveBeenCalledWith({
			include: { _count: { select: { Client: true, User: true } } },
		});

		const payload = vi.mocked(res.json).mock.calls[0][0] as Array<{ id: number; isTrainer: boolean; hasClient: boolean }>;
		expect(payload).toHaveLength(3);
		expect(payload[0]).toMatchObject({ id: 1, isTrainer: true, hasClient: false });
		expect(payload[1]).toMatchObject({ id: 2, isTrainer: false, hasClient: true });
		expect(payload[2]).toMatchObject({ id: 3, isTrainer: false, hasClient: false });
	});

	it('returns 500 on db error', async () => {
		vi.mocked(prisma.contact.findMany).mockRejectedValue(new Error('boom'));

		const res = createMockResponse();
		await handleGetContacts({} as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			hasError: true,
			errorMessage: 'An error occurred while fetching contacts.',
		});
	});
});
