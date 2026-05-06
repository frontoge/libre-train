import type { AddClientFormValues } from '@libre-train/shared';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCreateClient } from '../../api/handlers/client-handlers';
import { prisma } from '../../database/mysql-database';

const txClient = {
	contact: {
		findUnique: vi.fn(),
		update: vi.fn(),
		create: vi.fn(),
	},
	client: {
		create: vi.fn(),
	},
};

vi.mock('../../database/mysql-database', () => ({
	prisma: {
		$transaction: vi.fn(),
	},
}));

function createMockResponse() {
	const res = {} as Response;
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	return res;
}

function createMockRequest(body: AddClientFormValues | undefined): Request<{}, {}, AddClientFormValues> {
	return { body } as unknown as Request<{}, {}, AddClientFormValues>;
}

describe('handleCreateClient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		txClient.contact.findUnique.mockReset();
		txClient.contact.update.mockReset();
		txClient.contact.create.mockReset();
		txClient.client.create.mockReset();

		// eslint-disable-next-line no-unused-vars
		type TxFn = (tx: typeof txClient) => unknown;
		const transactionImpl = (fn: TxFn) => fn(txClient);
		vi.mocked(prisma.$transaction).mockImplementation(transactionImpl as unknown as typeof prisma.$transaction);
	});

	it('returns 400 when body is missing', async () => {
		const req = createMockRequest(undefined);
		const res = createMockResponse();

		await handleCreateClient(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({ message: 'Request body is required' });
	});

	it('creates a new contact and client when no contactId is provided', async () => {
		txClient.contact.create.mockResolvedValue({ id: 99 });
		txClient.client.create.mockResolvedValue({ id: 200 });

		const req = createMockRequest({
			firstName: 'Jane',
			lastName: 'Doe',
			email: 'jane@example.com',
			phoneNumber: '555-1111',
			trainerId: 7,
		});
		const res = createMockResponse();

		await handleCreateClient(req, res);

		expect(txClient.contact.create).toHaveBeenCalledOnce();
		expect(txClient.contact.findUnique).not.toHaveBeenCalled();
		expect(txClient.client.create).toHaveBeenCalledWith({
			data: { contactId: 99, trainerId: 7, height: null, notes: null },
		});
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({ id: 200 });
	});

	it('updates existing contact and links new client when contactId is provided', async () => {
		txClient.contact.findUnique.mockResolvedValue({
			id: 42,
			first_name: 'Old',
			last_name: 'Name',
			email: 'old@example.com',
			phone: null,
			date_of_birth: null,
			img: null,
			Client: [],
		});
		txClient.contact.update.mockResolvedValue({});
		txClient.client.create.mockResolvedValue({ id: 300 });

		const req = createMockRequest({
			firstName: 'New',
			lastName: 'Name',
			email: 'new@example.com',
			phoneNumber: '555-2222',
			trainerId: 7,
			contactId: 42,
			height: 180,
			notes: 'foo',
		});
		const res = createMockResponse();

		await handleCreateClient(req, res);

		expect(txClient.contact.create).not.toHaveBeenCalled();
		expect(txClient.contact.update).toHaveBeenCalledWith({
			where: { id: 42 },
			data: {
				first_name: 'New',
				last_name: 'Name',
				email: 'new@example.com',
				phone: '555-2222',
				date_of_birth: null,
				img: null,
			},
		});
		expect(txClient.client.create).toHaveBeenCalledWith({
			data: { contactId: 42, trainerId: 7, height: 180, notes: 'foo' },
		});
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.json).toHaveBeenCalledWith({ id: 300 });
	});

	it('returns 500 with error message when contactId references missing contact', async () => {
		txClient.contact.findUnique.mockResolvedValue(null);

		const req = createMockRequest({ trainerId: 1, contactId: 999 });
		const res = createMockResponse();

		await handleCreateClient(req, res);

		expect(txClient.client.create).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Contact not found.' });
	});

	it('returns 500 with error message when contact already has a client', async () => {
		txClient.contact.findUnique.mockResolvedValue({
			id: 42,
			first_name: 'Old',
			last_name: 'Name',
			email: 'old@example.com',
			phone: null,
			date_of_birth: null,
			img: null,
			Client: [{ id: 1 }],
		});

		const req = createMockRequest({ trainerId: 1, contactId: 42 });
		const res = createMockResponse();

		await handleCreateClient(req, res);

		expect(txClient.contact.update).not.toHaveBeenCalled();
		expect(txClient.client.create).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: 'Contact already has a client.' });
	});
});
