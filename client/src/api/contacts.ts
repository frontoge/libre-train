import type { Contact, ContactWithFlags, CreateContactRequest, UpdateContactRequest } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { apiFetch } from '../helpers/fetch-helpers';

export async function listContacts(): Promise<ContactWithFlags[]> {
	return apiFetch<ContactWithFlags[]>(Routes.Contacts, {
		method: 'GET',
		errorMessage: 'Failed to fetch contacts',
	});
}

export async function getContact(contactId: number): Promise<Contact> {
	return apiFetch<Contact>(`${Routes.Contacts}/${contactId}`, {
		method: 'GET',
		errorMessage: 'Failed to fetch contact',
	});
}

export async function createContact(data: CreateContactRequest): Promise<number> {
	return apiFetch<number, CreateContactRequest>(Routes.Contacts, {
		method: 'POST',
		body: data,
		errorMessage: 'Failed to create contact',
	});
}

export async function updateContact(contactId: number, data: UpdateContactRequest): Promise<void> {
	await apiFetch<void, UpdateContactRequest>(`${Routes.Contacts}/${contactId}`, {
		method: 'PUT',
		body: data,
		errorMessage: 'Failed to update contact',
	});
}

export async function deleteContact(contactId: number): Promise<void> {
	await apiFetch<void>(`${Routes.Contacts}/${contactId}`, {
		method: 'DELETE',
		errorMessage: 'Failed to delete contact',
	});
}
