import { Prisma } from '@libre-train/db/client';
import { Contact, CreateContactRequest, ResponseWithError, UpdateContactRequest } from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';

export const handleGetContacts = async (req: Request, res: Response<ResponseWithError<Contact[]>>) => {
	try {
		const results = await prisma.contact.findMany();

		const contacts: Contact[] = results.map((row) => ({
			id: row.id,
			first_name: row.first_name,
			last_name: row.last_name,
			email: row.email,
			phone: row.phone ?? undefined,
			img: row.img ?? undefined,
			date_of_birth: row.date_of_birth ? dayjs.utc(row.date_of_birth).format('YYYY-MM-DD') : undefined,
			created_at: dayjs.utc(row.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(row.updated_at).format('YYYY-MM-DD'),
		}));

		res.json(contacts);
	} catch (error) {
		console.error('Error fetching contacts:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching contacts.' });
		return;
	}
};

export const handleGetContactById = async (req: Request<{ id: string }>, res: Response<ResponseWithError<Contact>>) => {
	const { id } = req.params;
	try {
		const results = await prisma.contact.findUnique({ where: { id: parseInt(id, 10) } });

		if (!results?.id) {
			res.status(404).json({ hasError: true, errorMessage: 'Contact not found.' });
			return;
		}

		const row = results;
		const contact: Contact = {
			id: row.id,
			first_name: row.first_name,
			last_name: row.last_name,
			email: row.email,
			phone: row.phone ?? undefined,
			img: row.img ?? undefined,
			date_of_birth: row.date_of_birth ? dayjs.utc(row.date_of_birth).format('YYYY-MM-DD') : undefined,
			created_at: dayjs.utc(row.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(row.updated_at).format('YYYY-MM-DD'),
		};

		res.json(contact);
	} catch (error) {
		console.error('Error fetching contact:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching the contact.' });
		return;
	}
};

export const handleCreateContact = async (
	req: Request<{}, {}, CreateContactRequest>,
	res: Response<ResponseWithError<number>>
) => {
	const { first_name, last_name, email, phone, img, date_of_birth } = req.body;
	try {
		const data = {
			first_name,
			last_name,
			email,
			phone: phone ?? null,
			date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
			img: img ?? null,
		} satisfies Prisma.ContactCreateInput;

		const contact = await prisma.contact.create({
			data,
		});

		if (!contact?.id) {
			console.error('Failed to create contact:');
			res.status(500).json({ hasError: true, errorMessage: 'Failed to create contact.' });
			return;
		}

		res.json(contact.id);
	} catch (error) {
		console.error('Error creating contact:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while creating the contact.' });
		return;
	}
};

export const handleDeleteContact = async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;

	try {
		await prisma.contact.delete({ where: { id: parseInt(id, 10) } });

		res.status(204).send();
	} catch (error) {
		console.error('Error deleting contact:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while deleting the contact.' });
		return;
	}
};

export const handleUpdateContact = async (req: Request<{ id: string }, {}, UpdateContactRequest>, res: Response) => {
	const { id } = req.params;
	const { first_name, last_name, email, phone, img, date_of_birth } = req.body;
	try {
		const parsedId = parseInt(id, 10);
		const data = {
			first_name: first_name ?? undefined,
			last_name: last_name ?? undefined,
			email: email ?? undefined,
			phone: phone ?? undefined,
			date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
			img: img ?? undefined,
		} satisfies Prisma.ContactUpdateInput;

		await prisma.contact.update({
			where: { id: parsedId },
			data,
		});

		res.status(204).send();
	} catch (error) {
		console.error('Error updating contact:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while updating the contact.' });
		return;
	}
};
