import type { AssessmentClientLog, AssessmentClientLogCreateRequest, AssessmentClientLogSearchOptions } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';
import { createSearchParams } from '../helpers/fetch-helpers';

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
	const url = new URL(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}/${clientId}`);

	if (params) {
		url.search = createSearchParams(params).toString();
	}

	const response = await fetch(url, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json() as Promise<AssessmentClientLog[]>;
}

export async function createAssessmentLog(data: AssessmentClientLogCreateRequest): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to create assessment log: ${response.statusText}`);
	}
}

export async function updateAssessmentLog(logId: number, data: UpdateAssessmentLogRequest): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}/${logId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error(`Failed to update assessment log: ${response.statusText}`);
	}
}

export async function deleteAssessmentLog(logId: number): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}/${logId}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!response.ok) {
		throw new Error('Failed to delete assessment log entry');
	}
}
