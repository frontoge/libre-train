import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Prisma, PrismaClient } from '@libre-train/db/client';

const adapter = new PrismaMariaDb({
	host: process.env.DB_HOST!,
	port: Number(process.env.DB_PORT!),
	user: process.env.DB_USER!,
	password: process.env.DB_PASSWORD!,
	database: process.env.DB_NAME!,
});

const prisma = new PrismaClient({ adapter });

export { Prisma, prisma };
