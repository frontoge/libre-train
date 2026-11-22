import { useContext, useMemo } from 'react';
import { AppContext } from '../app-context';

export type PermissionRequirement = string | string[] | undefined;

// Central access to the signed-in user's effective permissions. Components and route/nav
// guards use `can` / `canAny` to decide what to show. A string[] requirement is satisfied when
// the user holds ANY of the listed keys (the common "view OR manage reaches this area" case).
export function usePermissions() {
	const {
		state: { permissions, permissionsLoaded },
	} = useContext(AppContext);

	return useMemo(() => {
		const set = new Set(permissions);
		const can = (key: string) => set.has(key);
		const canAny = (keys: string[]) => keys.some((key) => set.has(key));
		const canAll = (keys: string[]) => keys.every((key) => set.has(key));

		// Resolve a flexible requirement: undefined means "no permission needed".
		const isAllowed = (requirement: PermissionRequirement): boolean => {
			if (requirement === undefined) return true;
			return Array.isArray(requirement) ? canAny(requirement) : can(requirement);
		};

		return { permissions, loaded: permissionsLoaded, can, canAny, canAll, isAllowed };
	}, [permissions, permissionsLoaded]);
}
