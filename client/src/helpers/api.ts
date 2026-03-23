//TODO Move all api helper functions to here

import { Routes } from "../../../shared/routes";
import { getAppConfiguration } from "../config/app.config";
import type { WorkoutRoutineEdit } from "../types/types";

const API_BASE_URL = getAppConfiguration().apiUrl;

export const updateMicrocycleRoutines = async (microcycleId: number, routines: WorkoutRoutineEdit[]): Promise<Response> => {
    const body: string = JSON.stringify({ routines: routines.map(routine => ({
        routine_name: routine?.routine_name ?? undefined,
        exercise_groups: routine?.exercise_groups ?? [],
    })) });

    const requestOptions: RequestInit = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
    };
    try {
        return await fetch(`${API_BASE_URL}${Routes.Microcycle}/${microcycleId}${Routes.WorkoutRoutine}`, requestOptions); 
    } catch (error) {
        console.error('Error updating microcycle routines:', error);
        throw error;
    }
}

export const deleteMicrocycle = async (microcycleId: number): Promise<Response> => {
    const requestOptions: RequestInit = {
        method: 'DELETE',
    };
    try {
        return await fetch(`${API_BASE_URL}${Routes.Microcycle}/${microcycleId}`, requestOptions);
    } catch (error) {
        console.error('Error deleting microcycle:', error);
        throw error;
    }
}

export const deleteMesocycle = async (mesocycleId: number): Promise<Response> => {
    const requestOptions: RequestInit = {
        method: 'DELETE',
    };
    try {
        return await fetch(`${API_BASE_URL}${Routes.Mesocycle}/${mesocycleId}`, requestOptions);
    } catch (error) {
        console.error('Error deleting mesocycle:', error);
        throw error;
    }
}

export const deleteMacrocycle = async (macrocycleId: number): Promise<Response> => {
    const requestOptions: RequestInit = {
        method: 'DELETE',
    };
    try {
        return await fetch(`${API_BASE_URL}${Routes.Macrocycle}/${macrocycleId}`, requestOptions);
    } catch (error) {
        console.error('Error deleting macrocycle:', error);
        throw error;
    }
}