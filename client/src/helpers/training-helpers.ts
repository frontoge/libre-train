import { TrainingCycleType } from '@libre-train/shared';
import { createMacrocycle, createMesocycle, createMicrocycle } from '../api/training';
import type { CreateEditTrainingPlanFormValues } from '../components/Training/CreateEditTrainingPlan';

// Re-export training API functions for backward compatibility
export {
	fetchClientMacrocycles,
	fetchClientMesocycles,
	fetchClientMicrocycles,
	fetchChildMesocycles,
	fetchChildMicrocycles,
	fetchMicrocycleById,
} from '../api/training';

async function createMacrocycleFromForm(values: CreateEditTrainingPlanFormValues): Promise<number | undefined> {
	return createMacrocycle({
		cycle_name: values.cycleName ?? '',
		client_id: Number(values.selectedClient),
		cycle_start_date: values.dateRange[0].format('YYYY-MM-DD'),
		cycle_end_date: values.dateRange[1].format('YYYY-MM-DD'),
		isActive: values.isActive,
		notes: values.notes,
	});
}

async function createMesocycleFromForm(values: CreateEditTrainingPlanFormValues): Promise<number | undefined> {
	return createMesocycle({
		macrocycle_id: values.parentCycle,
		cycle_name: values.cycleName ?? '',
		cycle_start_date: values.dateRange[0].format('YYYY-MM-DD'),
		cycle_end_date: values.dateRange[1].format('YYYY-MM-DD'),
		is_active: values.isActive,
		opt_levels: values.optLevels,
		cardio_levels: values.cardioLevels,
		notes: values.notes,
	});
}

async function createMicrocycleFromForm(values: CreateEditTrainingPlanFormValues): Promise<number | undefined> {
	return createMicrocycle({
		mesocycle_id: values.parentCycle,
		cycle_name: values.cycleName ?? '',
		cycle_start_date: values.dateRange[0].format('YYYY-MM-DD'),
		cycle_end_date: values.dateRange[1].format('YYYY-MM-DD'),
		isActive: values.isActive,
		notes: values.notes,
	});
}

export const cycleCreateHelpers = {
	[TrainingCycleType.Macrocycle]: createMacrocycleFromForm,
	[TrainingCycleType.Mesocycle]: createMesocycleFromForm,
	[TrainingCycleType.Microcycle]: createMicrocycleFromForm,
};

export const optLevelTagColors: Record<number, string> = {
	1: 'green',
	2: 'gold',
	3: 'orange',
	4: 'volcano',
	5: 'red',
};

export const cardioLevelTagColors: Record<number, string> = {
	1: 'cyan',
	2: 'blue',
	3: 'geekblue',
	4: 'purple',
};
