import type {
	CreateUserRequest,
	EffectivePermissionsResponse,
	UpdateUserGroupsRequest,
	UserWithContact,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

// The signed-in user's effective permission keys. Authenticated by the in-memory access token.
export async function getMyPermissions(authToken: string): Promise<string[]> {
	const data = await apiFetch<EffectivePermissionsResponse>(Routes.UserPermissions, {
		method: 'GET',
		authToken,
		errorMessage: 'Failed to fetch permissions',
	});
	return data.permissions;
}

export async function listUsers(): Promise<UserWithContact[]> {
	return apiFetch<UserWithContact[]>(Routes.Users, {
		method: 'GET',
		errorMessage: 'Failed to fetch users',
	});
}

export async function createUser(body: CreateUserRequest): Promise<UserWithContact> {
	return apiFetch<UserWithContact, CreateUserRequest>(Routes.Users, {
		method: 'POST',
		body,
		errorMessage: 'Failed to create user',
	});
}

export async function updateUserGroups(userId: number, groupIds: number[]): Promise<void> {
	await apiFetch<void, UpdateUserGroupsRequest>(`${Routes.Users}/${userId}/groups`, {
		method: 'PUT',
		body: { groupIds },
		errorMessage: 'Failed to update user groups',
	});
}

// Set a temporary password for another user (requires the users.reset_password permission,
// enforced server-side). The target is forced to choose a new password on next sign-in.
export async function resetUserPassword(userId: number, password: string, authToken: string): Promise<void> {
	await apiFetch<void, { password: string }>(`${Routes.Users}/${userId}/reset-password`, {
		method: 'POST',
		body: { password },
		authToken,
		errorMessage: 'Failed to reset password',
	});
}
