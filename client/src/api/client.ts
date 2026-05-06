import type {
	AddClientFormValues,
	ClientContact,
	DailyUpdateRequest,
	DashboardData,
	DashboardWeeklySummary,
	UpdateClientRequest,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export type ClientDashboardSearchParams = {
	clientId: string;
	date: string;
};

export type ClientWeeklySummarySearchParams = {
	clientId: string;
	startDate: string;
	endDate: string;
};

export async function createClient(data: AddClientFormValues): Promise<{ id: number }> {
	return apiFetch<{ id: number }, AddClientFormValues>(Routes.Clients, {
		method: 'POST',
		body: data,
		errorMessage: 'Failed to add client',
	});
}

export async function updateClient(clientId: number, data: UpdateClientRequest): Promise<void> {
	await apiFetch<void, UpdateClientRequest>(`${Routes.Clients}/${clientId}`, {
		method: 'PUT',
		body: data,
		errorMessage: 'Failed to update client',
	});
}

export async function deleteClient(clientId: number): Promise<boolean> {
	try {
		await apiFetch<void>(`${Routes.Clients}/${clientId}`, {
			method: 'DELETE',
			errorMessage: 'Failed to delete client',
		});
		return true;
	} catch (error) {
		console.error('Error deleting client:', error);
		return false;
	}
}

export async function fetchClientContacts(clientId?: number): Promise<ClientContact[]> {
	try {
		return await apiFetch<ClientContact[]>(`${Routes.ClientContact}/${clientId ?? ''}`, {
			method: 'GET',
			errorMessage: 'Failed to fetch client contacts',
		});
	} catch (error) {
		console.error('Error fetching client contacts:', error);
		return [];
	}
}

export async function fetchClientDashboardData(params: ClientDashboardSearchParams): Promise<DashboardData> {
	return apiFetch<DashboardData>(`${Routes.Clients}/dashboard`, {
		method: 'GET',
		searchParams: params,
		errorMessage: 'Failed to fetch client dashboard data',
	});
}

export async function fetchClientWeeklySummary(params: ClientWeeklySummarySearchParams): Promise<DashboardWeeklySummary[]> {
	const data = await apiFetch<DashboardWeeklySummary[] | { message: string }>(`${Routes.Clients}/dashboard/summary`, {
		method: 'GET',
		searchParams: params,
		errorMessage: 'Failed to fetch client weekly summary',
	});

	if (data && !Array.isArray(data) && 'message' in data) {
		throw new Error(data.message);
	}

	return data as DashboardWeeklySummary[];
}

export async function submitClientDailyUpdate(data: DailyUpdateRequest): Promise<void> {
	await apiFetch<void, DailyUpdateRequest>(`${Routes.Clients}/daily-update`, {
		method: 'POST',
		body: data,
		errorMessage: 'Failed to submit daily update',
	});
}
