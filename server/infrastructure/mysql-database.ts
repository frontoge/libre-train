import mysql from 'mysql2/promise';

export const getDatabaseConnection = async () => {
	try {
		if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USER || !process.env.DB_PASSWORD) {
			throw new Error('Database connection details are not fully defined in environment variables');
		}
		return await mysql.createConnection({
			host: process.env.DB_HOST,
			port: Number(process.env.DB_PORT),
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			dateStrings: true,
		});
	} catch (error) {
		console.error('Error connecting to the database:', error);
		throw error;
	}
};

export async function closeDatabaseConnection(connection: mysql.Connection) {
	if (connection) await connection.end();
}
