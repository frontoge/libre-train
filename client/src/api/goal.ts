import type {
	ClientGoalSearchParams,
	ClientGoalWithRelations,
	CreateClientGoalRequest,
	UpdateClientGoalRequest,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

type GoalSearchOptions = Omit<ClientGoalSearchParams, 'clientId' | 'trainerId'>;

function ensureNoErrorEnvelope<T>(data: T, fallback: string): T {
	if (data && typeof data === 'object' && 'hasError' in data) {
		const errorMessage = (data as { errorMessage?: string }).errorMessage ?? fallback;
		throw new Error(errorMessage);
	}
	return data;
}

export async function fetchClientGoals(clientId: number, options?: GoalSearchOptions): Promise<ClientGoalWithRelations[]> {
	const data = await apiFetch<ClientGoalWithRelations[]>(Routes.Goal, {
		method: 'GET',
		searchParams: { clientId, ...options },
		errorMessage: 'Failed to fetch client goals',
	});
	return ensureNoErrorEnvelope(data, 'Failed to fetch client goals');
}

export async function fetchTrainerGoals(trainerId: number, options?: GoalSearchOptions): Promise<ClientGoalWithRelations[]> {
	const data = await apiFetch<ClientGoalWithRelations[]>(Routes.Goal, {
		method: 'GET',
		searchParams: { trainerId, ...options },
		errorMessage: 'Failed to fetch trainer goals',
	});
	return ensureNoErrorEnvelope(data, 'Failed to fetch trainer goals');
}

export async function fetchGoalById(goalId: number): Promise<ClientGoalWithRelations> {
	const data = await apiFetch<ClientGoalWithRelations>(`${Routes.Goal}/${goalId}`, {
		method: 'GET',
		errorMessage: 'Failed to fetch goal',
	});
	return ensureNoErrorEnvelope(data, 'Failed to fetch goal');
}

export async function createClientGoal(body: CreateClientGoalRequest): Promise<number> {
	const data = await apiFetch<{ goalId: number }, CreateClientGoalRequest>(Routes.Goal, {
		method: 'POST',
		body,
		errorMessage: 'Failed to create goal',
	});
	return data.goalId;
}

export async function updateClientGoal(goalId: number, body: UpdateClientGoalRequest): Promise<void> {
	await apiFetch<void, UpdateClientGoalRequest>(`${Routes.Goal}/${goalId}`, {
		method: 'PUT',
		body,
		errorMessage: 'Failed to update goal',
	});
}

export async function deleteClientGoal(goalId: number): Promise<void> {
	await apiFetch<void>(`${Routes.Goal}/${goalId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete goal',
	});
}
