import { Request, Response } from 'express';
import { ResponseWithError } from '../../../shared/types';
import { Contact } from '../../../shared/models';
import { closeDatabaseConnection, getDatabaseConnection } from '../../infrastructure/mysql-database';
import { RowDataPacket } from 'mysql2';

export const handleGetContacts = async (req: Request, res: Response<ResponseWithError<Contact[]>>) => {
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({sql: "SELECT * FROM Contact"});

        const contacts: Contact[] = results.map((row) => ({
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
            img: row.img,
            date_of_birth: row.date_of_birth,
            notes: row.notes
         }));

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({hasError: true, errorMessage: 'An error occurred while fetching contacts.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleGetContactById = async (req: Request<{id: string}>, res: Response<ResponseWithError<Contact>>) => {
    const connection = await getDatabaseConnection();
    const { id } = req.params;
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({
            sql: "SELECT * FROM Contact WHERE id = ?",
            values: [parseInt(id)]
        });

        if (results.length === 0 || !results[0]?.id) {
            res.status(404).json({hasError: true, errorMessage: 'Contact not found.' });
            return;
        }

        const row = results[0];
        const contact: Contact = {
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
            img: row.img,
            date_of_birth: row.date_of_birth,
         };

        res.json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({hasError: true, errorMessage: 'An error occurred while fetching the contact.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleCreateContact = async (req: Request<{}, {}, Omit<Contact, "id">>, res: Response<ResponseWithError<number>>) => {
    const connection = await getDatabaseConnection();
    const { first_name, last_name, email, phone, img, date_of_birth } = req.body;
    try {
        const [result] = await connection.query<RowDataPacket[][]>({
            sql: "CALL spCreateContact(?, ?, ?, ?, ?, ?)",
            values: [
                first_name,
                last_name,
                email,
                phone,
                date_of_birth,
                img
            ]
        });

        const insertResult = result[0];

        if (!insertResult || insertResult.length === 0 || !insertResult[0]?.id) {
            console.error('Failed to create contact:');
            res.status(500).json({hasError: true, errorMessage: 'Failed to create contact.' });
            return;
        }

        const newContactId = insertResult[0].id;
        res.json(newContactId);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({hasError: true, errorMessage: 'An error occurred while creating the contact.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleDeleteContact = async (req: Request<{id: string}>, res: Response) =>{
    const connection = await getDatabaseConnection();

    const { id } = req.params;

    try {
        await connection.query({
            sql: "DELETE FROM Contact WHERE id = ?",
            values: [parseInt(id)]
         });

         res.status(204).send();
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({hasError: true, errorMessage: 'An error occurred while deleting the contact.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export const handleUpdateContact = async (req: Request<{id: string}, {}, Omit<Partial<Contact>, "id">>, res: Response) => {
    const connection = await getDatabaseConnection();
    
    const { id } = req.params;
    const { first_name, last_name, email, phone, img, date_of_birth } = req.body;
    try {
        const [result, fields] = await connection.execute({
            sql: "CALL spUpdateContact(?, ?, ?, ?, ?, ?, ?)", 
            values: [
                parseInt(id),
                first_name ?? null,
                last_name ?? null,
                email ?? null,
                phone ?? null,
                date_of_birth ?? null,
                img ?? null,
            ]
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({hasError: true, errorMessage: 'An error occurred while updating the contact.' });
        return;
    } finally {
        await closeDatabaseConnection(connection);
    }
}