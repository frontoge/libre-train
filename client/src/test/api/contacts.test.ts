import { afterEach, describe, expect, it, vi } from 'vitest';
import { createContact, deleteContact, getContact, listContacts, updateContact } from '../../api/contacts';

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('contacts api', () => {
	describe('listContacts', () => {
		it('GETs the contacts route and returns the list', async () => {
			const data = [{ id: 1, first_name: 'Ada', isTrainer: false, hasClient: false }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

			const result = await listContacts();

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/contact', expect.objectContaining({ method: 'GET' }));
			expect(result).toEqual(data);
		});
	});

	describe('getContact', () => {
		it('GETs the specific contact', async () => {
			const data = { id: 5, first_name: 'Grace' };
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });

			const result = await getContact(5);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/contact/5', expect.objectContaining({ method: 'GET' }));
			expect(result).toEqual(data);
		});
	});

	describe('createContact', () => {
		it('POSTs new contact data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => 42 });
			const data = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' };

			const result = await createContact(data as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
			expect(result).toBe(42);
		});
	});

	describe('updateContact', () => {
		it('PUTs the contact update', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = { email: 'new@example.com' };

			await updateContact(10, data as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/contact/10', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});
	});

	describe('deleteContact', () => {
		it('DELETEs the contact', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await deleteContact(7);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/contact/7', expect.objectContaining({ method: 'DELETE' }));
		});

		it('throws when not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'gone' }) });
			await expect(deleteContact(7)).rejects.toThrow('gone');
		});
	});
});
