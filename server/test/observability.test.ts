import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { handleHealthCheck } from '../api/handlers';

function createMockResponse() {
	const response = {} as Response;
	response.status = vi.fn().mockReturnValue(response);
	response.json = vi.fn().mockReturnValue(response);
	return response;
}

describe('handleHealthCheck', () => {
	it('returns 200 status', () => {
		const req = {} as Request;
		const res = createMockResponse();

		handleHealthCheck(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
	});

	it('returns the expected JSON body', () => {
		const req = {} as Request;
		const res = createMockResponse();

		handleHealthCheck(req, res);

		expect(res.json).toHaveBeenCalledWith({
			message: 'Status: OK',
		});
	});
});
