import type { Macrocycle, Mesocycle, Microcycle, WorkoutRoutine } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';
import type { WorkoutRoutineEdit } from '../types/types';

export type CreateMacrocycleRequest = {
	cycle_name: string;
	client_id: number;
	cycle_start_date: string;
	cycle_end_date: string;
	isActive: boolean;
	notes?: string;
};

export type CreateMesocycleRequest = {
	macrocycle_id?: number;
	cycle_name: string;
	cycle_start_date: string;
	cycle_end_date: string;
	is_active: boolean;
	opt_levels?: number[];
	cardio_levels?: number[];
	notes?: string;
};

export type CreateMicrocycleRequest = {
	mesocycle_id?: number;
	cycle_name: string;
	cycle_start_date: string;
	cycle_end_date: string;
	isActive: boolean;
	notes?: string;
};

export type MicrocycleFetchParams = {
	clientId?: number;
	mesocycleId?: number;
	active?: boolean;
};

export type UpdateMicrocycleRoutinesRequest = {
	routines: Array<{
		routine_name?: string;
		exercise_groups: WorkoutRoutineEdit['exercise_groups'];
	}>;
};

export async function createMacrocycle(data: CreateMacrocycleRequest): Promise<number | undefined> {
	try {
		const result = await apiFetch<{ macrocycleId: number }, CreateMacrocycleRequest>(Routes.Macrocycle, {
			method: 'POST',
			body: data,
			errorMessage: 'Failed to create macrocycle',
		});
		return result.macrocycleId;
	} catch (error) {
		console.error('Error creating macrocycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function createMesocycle(data: CreateMesocycleRequest): Promise<number | undefined> {
	try {
		const result = await apiFetch<{ mesocycleId: number }, CreateMesocycleRequest>(Routes.Mesocycle, {
			method: 'POST',
			body: data,
			errorMessage: 'Failed to create mesocycle',
		});
		return result.mesocycleId;
	} catch (error) {
		console.error('Error creating mesocycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function createMicrocycle(data: CreateMicrocycleRequest): Promise<number | undefined> {
	try {
		const result = await apiFetch<{ microcycleId: number }, CreateMicrocycleRequest>(Routes.Microcycle, {
			method: 'POST',
			body: data,
			errorMessage: 'Failed to create microcycle',
		});
		return result.microcycleId;
	} catch (error) {
		console.error('Error creating microcycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function fetchClientMacrocycles(clientId: number): Promise<Macrocycle[]> {
	try {
		return await apiFetch<Macrocycle[]>(`${Routes.Macrocycle}/${clientId}`, {
			method: 'GET',
			errorMessage: 'Failed to fetch parent macrocycles',
		});
	} catch (error) {
		console.error('Error fetching parent macrocycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchClientMesocycles(clientId: number): Promise<Mesocycle[]> {
	try {
		return await apiFetch<Mesocycle[]>(`${Routes.Mesocycle}/${clientId}`, {
			method: 'GET',
			errorMessage: 'Failed to fetch parent mesocycles',
		});
	} catch (error) {
		console.error('Error fetching parent mesocycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchClientMicrocycles(params: MicrocycleFetchParams): Promise<Microcycle[]> {
	try {
		return await apiFetch<Microcycle[]>(Routes.Microcycle, {
			method: 'GET',
			searchParams: params,
			errorMessage: 'Failed to fetch parent microcycles',
		});
	} catch (error) {
		console.error('Error fetching parent microcycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchChildMesocycles(macrocycleId: number, clientId: number): Promise<Mesocycle[]> {
	try {
		return await apiFetch<Mesocycle[]>(`${Routes.Mesocycle}/${clientId}`, {
			method: 'GET',
			searchParams: { macrocycleId, active: true },
			errorMessage: 'Failed to fetch child mesocycles',
		});
	} catch (error) {
		console.error('Error fetching child mesocycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchChildMicrocycles(mesocycleId: number, clientId: number): Promise<Microcycle[]> {
	try {
		return await apiFetch<Microcycle[]>(Routes.Microcycle, {
			method: 'GET',
			searchParams: { clientId, mesocycleId, active: true },
			errorMessage: 'Failed to fetch child microcycles',
		});
	} catch (error) {
		console.error('Error fetching child microcycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchMicrocycleById(microcycleId: number): Promise<Microcycle | undefined> {
	try {
		const data = await apiFetch<Microcycle[]>(`${Routes.Microcycle}/${microcycleId}`, {
			method: 'GET',
			errorMessage: 'Failed to fetch microcycle',
		});
		return data[0];
	} catch (error) {
		console.error('Error fetching microcycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function deleteMacrocycle(macrocycleId: number): Promise<void> {
	await apiFetch<void>(`${Routes.Macrocycle}/${macrocycleId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete macrocycle',
	});
}

export async function deleteMesocycle(mesocycleId: number): Promise<void> {
	await apiFetch<void>(`${Routes.Mesocycle}/${mesocycleId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete mesocycle',
	});
}

export async function deleteMicrocycle(microcycleId: number): Promise<void> {
	await apiFetch<void>(`${Routes.Microcycle}/${microcycleId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete microcycle',
	});
}

export async function fetchMicrocycleRoutines(microcycleId: number): Promise<WorkoutRoutine[]> {
	try {
		return await apiFetch<WorkoutRoutine[]>(`${Routes.Microcycle}/${microcycleId}${Routes.WorkoutRoutine}`, {
			method: 'GET',
			errorMessage: `Failed to fetch routines for microcycle ${microcycleId}`,
		});
	} catch (error) {
		console.error(`Error fetching routines for microcycle ${microcycleId}:`, error instanceof Error ? error.message : error);
		return [];
	}
}

export async function updateMicrocycleRoutines(microcycleId: number, routines: WorkoutRoutineEdit[]): Promise<void> {
	const body: UpdateMicrocycleRoutinesRequest = {
		routines: routines.map((routine) => ({
			routine_name: routine?.routine_name ?? undefined,
			exercise_groups: routine?.exercise_groups ?? [],
		})),
	};

	await apiFetch<void, UpdateMicrocycleRoutinesRequest>(`${Routes.Microcycle}/${microcycleId}${Routes.WorkoutRoutine}`, {
		method: 'PUT',
		body,
		errorMessage: 'Failed to update microcycle routines',
	});
}
