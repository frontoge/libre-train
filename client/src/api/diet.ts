import type { ClientDietLogTodo, ClientDietPlan, ClientTrainingPlanTodo, CreateDietPlan, DietPlanLogEntry } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';
import { createSearchParams } from '../helpers/fetch-helpers';

export type DietLogEntryCreateRequest = Omit<DietPlanLogEntry, 'id' | 'dietPlanId'>;

export async function fetchClientDietPlan(clientId: number): Promise<ClientDietPlan> {
	try {
		const searchParams = createSearchParams({ clientId: clientId.toString() });
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.DietPlan}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Error fetching client diet plan: ${response.statusText}`);
		}

		const data = await response.json();
		return data[0] as ClientDietPlan;
	} catch (error) {
		console.error('Error fetching client diet plan:', error);
		return {} as ClientDietPlan;
	}
}

export async function fetchClientDietPlansForTrainer(trainerId: number): Promise<ClientDietPlan[]> {
	try {
		const searchParams = createSearchParams({ trainerId: trainerId.toString() });
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.DietPlan}${Routes.Clients}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});
		const data = await response.json();
		return data as ClientDietPlan[];
	} catch (error) {
		console.error('Error fetching client diet plans for trainer:', error);
		throw error;
	}
}

export async function fetchDietPlanLogEntries(dietPlanId: number): Promise<DietPlanLogEntry[]> {
	try {
		const searchParams = createSearchParams({ dietPlanId: dietPlanId.toString() });
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.DietLog}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});
		const data = await response.json();
		return data as DietPlanLogEntry[];
	} catch (error) {
		console.error('Error fetching diet plan log entries:', error);
		throw error;
	}
}

export async function fetchDietLogTodos(trainerId: number): Promise<ClientDietLogTodo[]> {
	try {
		const searchParams = createSearchParams({ trainerId: trainerId.toString() });
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.DietLogTodos}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Error fetching diet log todos: ${response.statusText}`);
		}

		const data = await response.json();
		return data as ClientDietLogTodo[];
	} catch (error) {
		console.error('Error fetching diet log todos:', error);
		throw error;
	}
}

export async function fetchTrainingPlanTodos(trainerId: number): Promise<ClientTrainingPlanTodo[]> {
	try {
		const searchParams = createSearchParams({ trainerId: trainerId.toString() });
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.TrainingPlanTodos}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Error fetching training plan todos: ${response.statusText}`);
		}

		const data = await response.json();
		return data as ClientTrainingPlanTodo[];
	} catch (error) {
		console.error('Error fetching training plan todos:', error);
		throw error;
	}
}

export async function createDietPlan(dietPlan: CreateDietPlan): Promise<Response> {
	try {
		return await fetch(`${getAppConfiguration().apiUrl}${Routes.DietPlan}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dietPlan),
		});
	} catch (error) {
		console.error('Error creating diet plan:', error);
		throw error;
	}
}

export async function deleteDietPlan(dietPlanId: number): Promise<Response> {
	try {
		return await fetch(`${getAppConfiguration().apiUrl}${Routes.DietPlan}/${dietPlanId}`, {
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting diet plan:', error);
		throw error;
	}
}

export async function createDietLogEntry(dietLogEntry: DietLogEntryCreateRequest): Promise<Response> {
	try {
		return await fetch(`${getAppConfiguration().apiUrl}${Routes.DietLog}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(dietLogEntry),
		});
	} catch (error) {
		console.error('Error creating diet log entry:', error);
		throw error;
	}
}
