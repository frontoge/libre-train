import { Request, Response } from "express";
import { getDatabaseConnection } from "../../infrastructure/mysql-database";
import { Client } from "../../../shared/types";
import { RowDataPacket } from "mysql2";

export const handleGetClients = async (req: Request, res: Response<Client[] | {message: string}>) => {
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({sql: "SELECT * FROM Client"});

        const clients: Client[] = results.map((row) => ({
            id: row.id,
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            phone: row.phone,
            created_at: row.created_at,
            updated_at: row.updated_at,
        }));

        res.json(clients);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: "An unexpected error occurred." });
    } 
};
