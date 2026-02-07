import mysql from 'mysql2/promise';
import { getConfiguration } from '../config/server.config';

const config = getConfiguration();

export const getDatabaseConnection = async () => {
    try {
        return await mysql.createConnection({
            host: config.database.host,
            port: config.database.port,
            user: process.env.DBUSER,
            password: process.env.DBPASSWORD,
            database: config.database.database
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
};

export async function closeDatabaseConnection(connection: mysql.Connection) {
    if (connection) await connection.end();
}