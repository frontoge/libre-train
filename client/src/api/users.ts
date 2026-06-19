import type { UserWithContact } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export async function listUsers(): Promise<UserWithContact[]> {
	return apiFetch<UserWithContact[]>(Routes.Users, {
		method: 'GET',
		errorMessage: 'Failed to fetch users',
	});
}
