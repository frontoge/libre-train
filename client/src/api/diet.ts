import type {
	ClientDietLogTodo,
	ClientDietPlan,
	ClientTrainingPlanTodo,
	CreateDietPlan,
	DietPlanLogEntry,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export type DietLogEntryCreateRequest = Omit<DietPlanLogEntry, 'id' | 'dietPlanId'>;

export async function fetchClientDietPlan(clientId: number): Promise<ClientDietPlan> {
	try {
		const data = await apiFetch<ClientDietPlan[]>(Routes.DietPlan, {
			method: 'GET',
			searchParams: { clientId },
			errorMessage: 'Error fetching client diet plan',
		});
		return data[0] ?? ({} as ClientDietPlan);
	} catch (error) {
		console.error('Error fetching client diet plan:', error);
		return {} as ClientDietPlan;
	}
}

export async function fetchClientDietPlansForTrainer(trainerId: number): Promise<ClientDietPlan[]> {
	return apiFetch<ClientDietPlan[]>(`${Routes.DietPlan}${Routes.Clients}`, {
		method: 'GET',
		searchParams: { trainerId },
		errorMessage: 'Error fetching client diet plans for trainer',
	});
}

export async function fetchDietPlanLogEntries(dietPlanId: number): Promise<DietPlanLogEntry[]> {
	return apiFetch<DietPlanLogEntry[]>(Routes.DietLog, {
		method: 'GET',
		searchParams: { dietPlanId },
		errorMessage: 'Error fetching diet plan log entries',
	});
}

export async function fetchDietLogTodos(trainerId: number): Promise<ClientDietLogTodo[]> {
	return apiFetch<ClientDietLogTodo[]>(Routes.DietLogTodos, {
		method: 'GET',
		searchParams: { trainerId },
		errorMessage: 'Error fetching diet log todos',
	});
}

export async function fetchTrainingPlanTodos(trainerId: number): Promise<ClientTrainingPlanTodo[]> {
	return apiFetch<ClientTrainingPlanTodo[]>(Routes.TrainingPlanTodos, {
		method: 'GET',
		searchParams: { trainerId },
		errorMessage: 'Error fetching training plan todos',
	});
}

export async function createDietPlan(dietPlan: CreateDietPlan): Promise<void> {
	await apiFetch<void, CreateDietPlan>(Routes.DietPlan, {
		method: 'POST',
		body: dietPlan,
		errorMessage: 'Failed to create diet plan',
	});
}

export async function deleteDietPlan(dietPlanId: number): Promise<void> {
	await apiFetch<void>(`${Routes.DietPlan}/${dietPlanId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete diet plan',
	});
}

export async function createDietLogEntry(dietLogEntry: DietLogEntryCreateRequest): Promise<void> {
	await apiFetch<void, DietLogEntryCreateRequest>(Routes.DietLog, {
		method: 'POST',
		body: dietLogEntry,
		errorMessage: 'Failed to create diet log entry',
	});
}
