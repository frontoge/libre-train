import type {
	AssessmentClientLog,
	AssessmentClientLogCreateRequest,
	AssessmentClientLogSearchOptions,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export type UpdateAssessmentLogRequest = {
	clientId?: number;
	assessmentTypeId?: number;
	assessmentDate?: string;
	assessmentValue?: string | number;
	notes?: string;
};

export async function fetchAssessmentLogs(
	clientId: number,
	params?: AssessmentClientLogSearchOptions
): Promise<AssessmentClientLog[]> {
	return apiFetch<AssessmentClientLog[]>(`${Routes.AssessmentLog}/${clientId}`, {
		method: 'GET',
		searchParams: params as Record<string, unknown> | undefined,
		errorMessage: 'Failed to fetch assessment logs',
	});
}

export async function createAssessmentLog(data: AssessmentClientLogCreateRequest): Promise<void> {
	await apiFetch<void, AssessmentClientLogCreateRequest>(Routes.AssessmentLog, {
		method: 'POST',
		body: data,
		errorMessage: 'Failed to create assessment log',
	});
}

export async function updateAssessmentLog(logId: number, data: UpdateAssessmentLogRequest): Promise<void> {
	await apiFetch<void, UpdateAssessmentLogRequest>(`${Routes.AssessmentLog}/${logId}`, {
		method: 'PUT',
		body: data,
		errorMessage: 'Failed to update assessment log',
	});
}

export async function deleteAssessmentLog(logId: number): Promise<void> {
	await apiFetch<void>(`${Routes.AssessmentLog}/${logId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete assessment log entry',
	});
}
