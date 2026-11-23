import { describe, expect, it, vi } from 'vitest';
import { isLocalDbHost } from '../../scripts/seed-dev-admin';

vi.mock('../../database/mysql-database', () => ({ prisma: {} }));

describe('isLocalDbHost', () => {
	it.each(['localhost', '127.0.0.1', '::1', ' LOCALHOST '])('accepts %s', (host) => {
		expect(isLocalDbHost(host)).toBe(true);
	});

	it.each([undefined, '', 'edenrp.net', '10.0.0.5', 'db.example.com', 'localhost.example.com'])('rejects %s', (host) => {
		expect(isLocalDbHost(host)).toBe(false);
	});
});
