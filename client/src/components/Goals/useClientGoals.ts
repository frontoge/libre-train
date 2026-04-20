import type { ClientGoalSearchParams, ClientGoalWithRelations } from '@libre-train/shared';
import { useCallback, useEffect, useState } from 'react';
import { fetchClientGoals } from '../../helpers/goals-api';

export interface UseClientGoalsResult {
	goals: ClientGoalWithRelations[];
	loading: boolean;
	error?: string;
	refresh: () => Promise<void>;
}

export function useClientGoals(
	clientId: number | undefined,
	options?: Omit<ClientGoalSearchParams, 'clientId' | 'trainerId'>
): UseClientGoalsResult {
	const [goals, setGoals] = useState<ClientGoalWithRelations[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);

	const status = options?.status;
	const cycleLevel = options?.cycleLevel;
	const cycleId = options?.cycleId;
	const activeCyclesOnly = options?.activeCyclesOnly;

	const load = useCallback(async () => {
		if (clientId === undefined) return;
		setLoading(true);
		setError(undefined);
		try {
			const goalsResult = await fetchClientGoals(clientId, { status, cycleLevel, cycleId, activeCyclesOnly });
			setGoals(goalsResult);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load goals');
		} finally {
			setLoading(false);
		}
	}, [clientId, status, cycleLevel, cycleId, activeCyclesOnly]);

	useEffect(() => {
		load();
	}, [load]);

	return { goals, loading, error, refresh: load };
}
