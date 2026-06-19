import { UserWithContact } from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';
import { MessageResponse } from '../../types/utilities';

export const handleGetUsers = async (_req: Request, res: Response<UserWithContact[] | MessageResponse>) => {
	try {
		// Never select `pass` (the password hash); pull the linked Contact for identity fields.
		const users = await prisma.user.findMany({
			select: {
				id: true,
				username: true,
				created_at: true,
				updated_at: true,
				contactId: true,
				Contact: {
					select: { first_name: true, last_name: true, email: true, phone: true, img: true },
				},
			},
			orderBy: { id: 'asc' },
		});

		const mappedUsers: UserWithContact[] = users.map((user) => ({
			id: user.id,
			username: user.username,
			contactId: user.contactId,
			created_at: dayjs.utc(user.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(user.updated_at).format('YYYY-MM-DD'),
			first_name: user.Contact.first_name,
			last_name: user.Contact.last_name,
			email: user.Contact.email,
			phone: user.Contact.phone ?? undefined,
			img: user.Contact.img ?? undefined,
		}));

		res.status(200).json(mappedUsers);
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error fetching users:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error fetching users:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};
