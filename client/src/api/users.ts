import type { CreateUserRequest, UpdateUserGroupsRequest, UserWithContact } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

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
