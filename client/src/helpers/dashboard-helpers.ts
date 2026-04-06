import dayjs from 'dayjs';
import type { CheckIn, TrainingPlanStatus } from '../types/types';
import { fetchDietLogTodos, fetchTrainingPlanTodos } from './api';

export async function getTrainerCheckIns(trainerId: number): Promise<CheckIn[]> {
	const checkIns: CheckIn[] = [];

	// Return a list of CheckIn objects for the dashboard
	// Possible Check ins:
	// - Client has a diet plan and no log today - medium priority
	// - Client has a diet plan and no log in last 3 days - high priority
	const dietCheckIns = await fetchDietLogTodos(trainerId);
	dietCheckIns.forEach((todo) => {
		const lastLogDate = todo.lastLogDate ? dayjs(todo.lastLogDate) : undefined;
		let risk: 'low' | 'medium' | 'high' = 'medium';

		const daysSinceLastLog = lastLogDate ? dayjs().diff(lastLogDate, 'day') : undefined;

		if (daysSinceLastLog !== undefined && daysSinceLastLog >= 3) {
			risk = 'high';
		}

		const checkIn: CheckIn = {
			id: todo.clientId,
			clientName: `${todo.first_name} ${todo.last_name}`,
			lastCheckIn: daysSinceLastLog !== undefined ? `${daysSinceLastLog} day(s) ago` : 'Never',
			note: risk === 'high' ? 'No diet log in last 3 days' : 'No diet log today',
			risk,
		};
		checkIns.push(checkIn);
	});
	// - Client has not had a composition assessment in > 30 days - medium priority
	// - Client has not had a composition assessment in > 60 days - high priority
	return checkIns;
}

export async function getTrainerMissingPlans(trainerId: number): Promise<TrainingPlanStatus[]> {
	const result = await fetchTrainingPlanTodos(trainerId);

	return result.map((item) => ({
		id: item.clientId,
		clientName: `${item.first_name} ${item.last_name}`,
		priority: 'high',
	}));
}
