import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAssessmentLog, deleteAssessmentLog, fetchAssessmentLogs, updateAssessmentLog } from '../../api/assessment';

vi.mock('../../config/app.config', () => ({
	getAppConfiguration: () => ({ apiUrl: 'http://test-api' }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

afterEach(() => {
	vi.clearAllMocks();
});

describe('assessment api', () => {
	describe('fetchAssessmentLogs', () => {
		it('fetches assessment logs for a client', async () => {
			const logs = [{ id: 1, assessment_type_id: 2 }];
			mockFetch.mockResolvedValueOnce({ ok: true, json: async () => logs });

			const result = await fetchAssessmentLogs(5);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({ href: expect.stringContaining('/assessment/log/5') }),
				expect.objectContaining({ method: 'GET' })
			);
			expect(result).toEqual(logs);
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

			await expect(fetchAssessmentLogs(1)).rejects.toThrow('HTTP error! status: 500');
		});
	});

	describe('createAssessmentLog', () => {
		it('posts assessment log data', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = {
				clientId: 5,
				assessments: [{ assessmentTypeId: 2, assessmentDate: '2026-01-01', assessmentValue: '75' }],
			};

			await createAssessmentLog(data as any);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/assessment/log', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Bad Request' });

			await expect(createAssessmentLog({} as any)).rejects.toThrow('Failed to create assessment log');
		});
	});

	describe('updateAssessmentLog', () => {
		it('sends PUT request for log update', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });
			const data = { assessmentValue: '80', notes: 'Updated' };

			await updateAssessmentLog(3, data);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/assessment/log/3', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Not Found' });

			await expect(updateAssessmentLog(99, {})).rejects.toThrow('Failed to update assessment log');
		});
	});

	describe('deleteAssessmentLog', () => {
		it('sends DELETE request for assessment log', async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await deleteAssessmentLog(7);

			expect(mockFetch).toHaveBeenCalledWith('http://test-api/assessment/log/7', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
			});
		});

		it('throws when response is not ok', async () => {
			mockFetch.mockResolvedValueOnce({ ok: false });

			await expect(deleteAssessmentLog(99)).rejects.toThrow('Failed to delete assessment log entry');
		});
	});
});
