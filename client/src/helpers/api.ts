//TODO Move all api helper functions to here

import type { ClientDietPlan, DietPlan, DietPlanLogEntry } from "@libre-train/shared";
import { Routes } from "@libre-train/shared";
import { getAppConfiguration } from "../config/app.config";
import type { WorkoutRoutineEdit } from "../types/types";
import { createSearchParams } from "./fetch-helpers";

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

export const fetchClientDietPlansForTrainer = async (trainerId: number): Promise<ClientDietPlan[]> => {
    try {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        const searchParams = createSearchParams({ trainerId: trainerId.toString()});
        const response = await fetch(`${API_BASE_URL}${Routes.DietPlan}${Routes.Clients}?${searchParams}`, requestOptions);
        const data = await response.json();
        return data as ClientDietPlan[];
    } catch (error) {
        console.error('Error fetching client diet plans for trainer:', error);
        throw error;
    }
}

export const fetchDietPlanLogEntries = async (dietPlanId: number): Promise<DietPlanLogEntry[]> => {
    try {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        const searchParams = createSearchParams({ dietPlanId: dietPlanId.toString()});
        const response = await fetch(`${API_BASE_URL}${Routes.DietLog}?${searchParams}`, requestOptions);
        const data = await response.json();
        return data as DietPlanLogEntry[];
    } catch (error) {
        console.error('Error fetching diet plan log entries:', error);
        throw error;
    }
}

export const fetchClientDietPlan = async (clientId: number): Promise<ClientDietPlan> => {
    try {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        const searchParams = createSearchParams({ clientId: clientId.toString()});
        const response = await fetch(`${API_BASE_URL}${Routes.DietPlan}?${searchParams}`, requestOptions);
        if (!response.ok) {
            throw new Error(`Error fetching client diet plan: ${response.statusText}`);
        }
        const data = await response.json();
        return data[0] as ClientDietPlan;
    } catch (error) {
        console.error('Error fetching client diet plan:', error);
        return {} as ClientDietPlan; //Return empty plan if error occurs
    }
}

export const createDietPlan = async (dietPlan: Omit<DietPlan, 'id' | 'isActive'>): Promise<Response> => {
    const body: string = JSON.stringify(dietPlan);

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    };
    try {
        return await fetch(`${API_BASE_URL}${Routes.DietPlan}`, requestOptions);
    } catch (error) {
        console.error('Error creating diet plan:', error);
        throw error;
    }
}

export const deleteDietPlan = async (dietPlanId: number): Promise<Response> => {
    const requestOptions: RequestInit = {
        method: 'DELETE',
    };
    try {
        return await fetch(`${API_BASE_URL}${Routes.DietPlan}/${dietPlanId}`, requestOptions);
    } catch (error) {
        console.error('Error deleting diet plan:', error);
        throw error;
    }
}

export const createDietLogEntry = async (dietLogEntry: Omit<DietPlanLogEntry, 'id' | 'dietPlanId'>): Promise<Response> => {
    const body: string = JSON.stringify(dietLogEntry);

    const requestOptions: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
    };
    try {
        return await fetch(`${API_BASE_URL}${Routes.DietLog}`, requestOptions);
    } catch (error) {
        console.error('Error creating diet log entry:', error);
        throw error;
    }
}