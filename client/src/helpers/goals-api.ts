import type {
	ClientGoalSearchParams,
	ClientGoalWithRelations,
	CreateClientGoalRequest,
	UpdateClientGoalRequest,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';
import { createSearchParams } from './fetch-helpers';

const API_BASE_URL = getAppConfiguration().apiUrl;

export async function fetchClientGoals(
	clientId: number,
	options?: Omit<ClientGoalSearchParams, 'clientId' | 'trainerId'>
): Promise<ClientGoalWithRelations[]> {
	const params = createSearchParams({ clientId, ...options });
	const response = await fetch(`${API_BASE_URL}${Routes.Goal}?${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch client goals: ${response.statusText}`);
	}
	const data = await response.json();
	if (data && typeof data === 'object' && 'hasError' in data) {
		throw new Error(data.errorMessage ?? 'Failed to fetch client goals');
	}
	return data as ClientGoalWithRelations[];
}

export async function fetchTrainerGoals(
	trainerId: number,
	options?: Omit<ClientGoalSearchParams, 'clientId' | 'trainerId'>
): Promise<ClientGoalWithRelations[]> {
	const params = createSearchParams({ trainerId, ...options });
	const response = await fetch(`${API_BASE_URL}${Routes.Goal}?${params}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch trainer goals: ${response.statusText}`);
	}
	const data = await response.json();
	if (data && typeof data === 'object' && 'hasError' in data) {
		throw new Error(data.errorMessage ?? 'Failed to fetch trainer goals');
	}
	return data as ClientGoalWithRelations[];
}

export async function fetchGoalById(goalId: number): Promise<ClientGoalWithRelations> {
	const response = await fetch(`${API_BASE_URL}${Routes.Goal}/${goalId}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch goal: ${response.statusText}`);
	}
	const data = await response.json();
	if (data && typeof data === 'object' && 'hasError' in data) {
		throw new Error(data.errorMessage ?? 'Failed to fetch goal');
	}
	return data as ClientGoalWithRelations;
}

export async function createClientGoal(body: CreateClientGoalRequest): Promise<number> {
	const response = await fetch(`${API_BASE_URL}${Routes.Goal}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error ?? `Failed to create goal: ${response.statusText}`);
	}
	const data = await response.json();
	return data.goalId as number;
}

export async function updateClientGoal(goalId: number, body: UpdateClientGoalRequest): Promise<void> {
	const response = await fetch(`${API_BASE_URL}${Routes.Goal}/${goalId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error ?? `Failed to update goal: ${response.statusText}`);
	}
}

export async function deleteClientGoal(goalId: number): Promise<void> {
	const response = await fetch(`${API_BASE_URL}${Routes.Goal}/${goalId}`, { method: 'DELETE' });
	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.error ?? `Failed to delete goal: ${response.statusText}`);
	}
}
