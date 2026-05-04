import type { Macrocycle, Mesocycle, Microcycle, WorkoutRoutine } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';
import { createSearchParams } from '../helpers/fetch-helpers';
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

export async function createMacrocycle(data: CreateMacrocycleRequest): Promise<number | undefined> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Macrocycle}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Failed to create macrocycle: ${response.statusText}`);
		}

		const result = await response.json();
		return result.macrocycleId as number;
	} catch (error: Error | unknown) {
		console.error('Error creating macrocycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function createMesocycle(data: CreateMesocycleRequest): Promise<number | undefined> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Mesocycle}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Failed to create mesocycle: ${response.statusText}`);
		}

		const result = await response.json();
		return result.mesocycleId as number;
	} catch (error: Error | unknown) {
		console.error('Error creating mesocycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function createMicrocycle(data: CreateMicrocycleRequest): Promise<number | undefined> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Microcycle}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Failed to create microcycle: ${response.statusText}`);
		}

		const result = await response.json();
		return result.microcycleId as number;
	} catch (error: Error | unknown) {
		console.error('Error creating microcycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function fetchClientMacrocycles(clientId: number): Promise<Macrocycle[]> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Macrocycle}/${clientId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch parent macrocycles: ${response.statusText}`);
		}

		const data = await response.json();
		return data as Macrocycle[];
	} catch (error: Error | unknown) {
		console.error('Error fetching parent macrocycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchClientMesocycles(clientId: number): Promise<Mesocycle[]> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Mesocycle}/${clientId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch parent mesocycles: ${response.statusText}`);
		}

		const data = await response.json();
		return data as Mesocycle[];
	} catch (error: Error | unknown) {
		console.error('Error fetching parent mesocycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchClientMicrocycles(params: MicrocycleFetchParams): Promise<Microcycle[]> {
	try {
		const searchParams = createSearchParams(params);
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Microcycle}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch parent microcycles: ${response.statusText}`);
		}

		const data = await response.json();
		return data as Microcycle[];
	} catch (error: Error | unknown) {
		console.error('Error fetching parent microcycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchChildMesocycles(macrocycleId: number, clientId: number): Promise<Mesocycle[]> {
	try {
		const searchParams = createSearchParams({ macrocycleId, active: true });
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Mesocycle}/${clientId}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch child mesocycles: ${response.statusText}`);
		}

		const data = await response.json();
		return data as Mesocycle[];
	} catch (error: Error | unknown) {
		console.error('Error fetching child mesocycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchChildMicrocycles(mesocycleId: number, clientId: number): Promise<Microcycle[]> {
	try {
		const searchParams = createSearchParams({ clientId, mesocycleId, active: true });
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Microcycle}?${searchParams}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch child microcycles: ${response.statusText}`);
		}

		const data = await response.json();
		return data as Microcycle[];
	} catch (error: Error | unknown) {
		console.error('Error fetching child microcycles:', error instanceof Error ? error.message : error);
		return [];
	}
}

export async function fetchMicrocycleById(microcycleId: number): Promise<Microcycle | undefined> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Microcycle}/${microcycleId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch microcycle: ${response.statusText}`);
		}

		const data = await response.json();

		if (data.length === 0) {
			return undefined;
		}

		return data[0] as Microcycle;
	} catch (error: Error | unknown) {
		console.error('Error fetching microcycle:', error instanceof Error ? error.message : error);
		return undefined;
	}
}

export async function deleteMacrocycle(macrocycleId: number): Promise<Response> {
	try {
		return await fetch(`${getAppConfiguration().apiUrl}${Routes.Macrocycle}/${macrocycleId}`, {
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting macrocycle:', error);
		throw error;
	}
}

export async function deleteMesocycle(mesocycleId: number): Promise<Response> {
	try {
		return await fetch(`${getAppConfiguration().apiUrl}${Routes.Mesocycle}/${mesocycleId}`, {
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting mesocycle:', error);
		throw error;
	}
}

export async function deleteMicrocycle(microcycleId: number): Promise<Response> {
	try {
		return await fetch(`${getAppConfiguration().apiUrl}${Routes.Microcycle}/${microcycleId}`, {
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting microcycle:', error);
		throw error;
	}
}

export async function fetchMicrocycleRoutines(microcycleId: number): Promise<WorkoutRoutine[]> {
	try {
		const response = await fetch(
			`${getAppConfiguration().apiUrl}${Routes.Microcycle}/${microcycleId}${Routes.WorkoutRoutine}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch routines for microcycle ${microcycleId}: ${response.statusText}`);
		}

		const data = await response.json();
		return data as WorkoutRoutine[];
	} catch (error: Error | unknown) {
		console.error(`Error fetching routines for microcycle ${microcycleId}:`, error instanceof Error ? error.message : error);
		return [];
	}
}

export async function updateMicrocycleRoutines(microcycleId: number, routines: WorkoutRoutineEdit[]): Promise<Response> {
	const body = JSON.stringify({
		routines: routines.map((routine) => ({
			routine_name: routine?.routine_name ?? undefined,
			exercise_groups: routine?.exercise_groups ?? [],
		})),
	});

	try {
		return await fetch(`${getAppConfiguration().apiUrl}${Routes.Microcycle}/${microcycleId}${Routes.WorkoutRoutine}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body,
		});
	} catch (error) {
		console.error('Error updating microcycle routines:', error);
		throw error;
	}
}
