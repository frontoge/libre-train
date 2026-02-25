import { TrainingCycleType } from "../../../shared/types";
import type { CreateEditTrainingPlanFormValues } from "../components/Training/CreateEditTrainingPlan";
import { getAppConfiguration } from "../config/app.config";
import { Routes } from "../../../shared/routes";
import type { Macrocycle } from "../../../shared/models";

async function createMacrocycle(values: CreateEditTrainingPlanFormValues): Promise<boolean> {
    const requestBody = {
        cycle_name: values.cycleName,
        client_id: values.selectedClient,
        cycle_start_date: values.dateRange[0].format("YYYY-MM-DD"),
        cycle_end_date: values.dateRange[1].format("YYYY-MM-DD"),
        isActive: values.isActive,
        notes: values.notes,
    }

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    }

    try {
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Macrocycle}`, requestOptions);
        if (!response.ok) {
            throw new Error(`Failed to create macrocycle: ${response.statusText}`);
        }
        return true;
    } catch (error: Error | unknown) {
        console.error("Error creating macrocycle:", error instanceof Error ? error.message : error);
    }

    return false;
}

async function createMesocycle(values: CreateEditTrainingPlanFormValues): Promise<boolean> {
    const requestBody = {
        macrocycle_id: values.parentCycle,
        cycle_name: values.cycleName,
        cycle_start_date: values.dateRange[0].format("YYYY-MM-DD"),
        cycle_end_date: values.dateRange[1].format("YYYY-MM-DD"),
        isActive: values.isActive,
        opt_levels: values.optLevels,
        cardio_levels: values.cardioLevels,
        notes: values.notes,
    }

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    }

    try {
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Mesocycle}`, requestOptions);
        if (!response.ok) {
            throw new Error(`Failed to create mesocycle: ${response.statusText}`);
        }
        return true;
    } catch (error: Error | unknown) {
        console.error("Error creating mesocycle:", error instanceof Error ? error.message : error);
    }

    return false;
}

async function createMicrocycle(values: CreateEditTrainingPlanFormValues): Promise<boolean> {
    const requestBody = {
        mesocycle_id: values.parentCycle,
        cycle_name: values.cycleName,
        cycle_start_date: values.dateRange[0].format("YYYY-MM-DD"),
        cycle_end_date: values.dateRange[1].format("YYYY-MM-DD"),
        isActive: values.isActive,
        notes: values.notes,
    }
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    }
    
    try {
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Microcycle}`, requestOptions);
        if (!response.ok) {
            throw new Error(`Failed to create microcycle: ${response.statusText}`);
        }
        return true;
    } catch (error: Error | unknown) {
        console.error("Error creating microcycle:", error instanceof Error ? error.message : error);
    }
    return false;
}

export const cycleCreateHelpers = {
    [TrainingCycleType.Macrocycle]: createMacrocycle,
    [TrainingCycleType.Mesocycle]: createMesocycle,
    [TrainingCycleType.Microcycle]: createMicrocycle,
}

export async function fetchParentMacrocycles(clientId: number): Promise<Macrocycle[]> {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Macrocycle}/${clientId}`, requestOptions);
        if (!response.ok) {
            throw new Error(`Failed to fetch parent macrocycles: ${response.statusText}`);
        }
        const data = await response.json();
        return data as Macrocycle[];
    } catch (error: Error | unknown) {
        console.error("Error fetching parent macrocycles:", error instanceof Error ? error.message : error);
        return [];
    }
}

export async function fetchParentMesocycles(clientId: number): Promise<Macrocycle[]> {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    try {
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Mesocycle}/${clientId}`, requestOptions);
        if (!response.ok) {
            throw new Error(`Failed to fetch parent mesocycles: ${response.statusText}`);
        }
        const data = await response.json();
        return data as Macrocycle[];
    } catch (error: Error | unknown) {
        console.error("Error fetching parent mesocycles:", error instanceof Error ? error.message : error);
        return [];
    }
}

export const optLevelTagColors: Record<number, string> = {
    1: 'green',
    2: 'gold',
    3: 'orange',
    4: 'volcano',
    5: 'red',
}

export const cardioLevelTagColors: Record<number, string> = {
    1: 'cyan',
    2: 'blue',
    3: 'geekblue',
    4: 'purple',
}