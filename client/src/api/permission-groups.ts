import type {
	CreatePermissionGroupRequest,
	PermissionGroupWithPermissions,
	UpdatePermissionGroupRequest,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export async function listPermissionGroups(): Promise<PermissionGroupWithPermissions[]> {
	return apiFetch<PermissionGroupWithPermissions[]>(Routes.PermissionGroups, {
		method: 'GET',
		errorMessage: 'Failed to fetch permission groups',
	});
}

export async function createPermissionGroup(data: CreatePermissionGroupRequest): Promise<{ id: number }> {
	return apiFetch<{ id: number }, CreatePermissionGroupRequest>(Routes.PermissionGroups, {
		method: 'POST',
		body: data,
		errorMessage: 'Failed to create permission group',
	});
}

export async function updatePermissionGroup(id: number, data: UpdatePermissionGroupRequest): Promise<void> {
	await apiFetch<void, UpdatePermissionGroupRequest>(`${Routes.PermissionGroups}/${id}`, {
		method: 'PUT',
		body: data,
		errorMessage: 'Failed to update permission group',
	});
}

export async function deletePermissionGroup(id: number): Promise<void> {
	await apiFetch<void>(`${Routes.PermissionGroups}/${id}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete permission group',
	});
}
