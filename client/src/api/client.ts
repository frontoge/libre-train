import type {
	AddClientFormValues,
	ClientContact,
	DashboardData,
	DashboardWeeklySummary,
	DailyUpdateRequest,
	UpdateClientRequest,
	UpdateContactRequest,
} from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';
import { createSearchParams } from '../helpers/fetch-helpers';

export type ClientDashboardSearchParams = {
	clientId: string;
	date: string;
};

export type ClientWeeklySummarySearchParams = {
	clientId: string;
	startDate: string;
	endDate: string;
};

export async function createClient(data: AddClientFormValues): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.errorMessage || 'Failed to add client');
	}
}

export async function updateClient(clientId: number, data: UpdateClientRequest): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/${clientId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.errorMessage || 'Failed to update client');
	}
}

export async function deleteClient(clientId: number): Promise<boolean> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/${clientId}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.errorMessage || 'Failed to delete client');
		}

		return true;
	} catch (error) {
		console.error('Error deleting client:', error);
		return false;
	}
}

export async function fetchClientContacts(clientId?: number): Promise<ClientContact[]> {
	try {
		const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.ClientContact}/${clientId ?? ''}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		});
		const data = await response.json();
		return data as ClientContact[];
	} catch (error) {
		console.error('Error fetching client contacts:', error);
		return [];
	}
}

export async function updateContact(contactId: number, data: UpdateContactRequest): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Contacts}/${contactId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.errorMessage || 'Failed to update contact');
	}
}

export async function fetchClientDashboardData(params: ClientDashboardSearchParams): Promise<DashboardData> {
	const searchParams = createSearchParams(params);
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/dashboard?${searchParams}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch client dashboard data: ${response.statusText}`);
	}

	return response.json() as Promise<DashboardData>;
}

export async function fetchClientWeeklySummary(params: ClientWeeklySummarySearchParams): Promise<DashboardWeeklySummary[]> {
	const searchParams = createSearchParams(params);
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/dashboard/summary?${searchParams}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	const data = await response.json();

	if ('message' in data) {
		throw new Error(data.message);
	}

	return data as DashboardWeeklySummary[];
}

export async function submitClientDailyUpdate(data: DailyUpdateRequest): Promise<void> {
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}/daily-update`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error('Failed to submit daily update');
	}
}
