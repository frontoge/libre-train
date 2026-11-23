// Local development only: create (or repair) an Administrator login so a fresh database is
// usable right away. Run from the repo root with `bun run seed:dev`.
//
// Credentials default to dev / Password1 and can be overridden with SEED_ADMIN_USERNAME,
// SEED_ADMIN_PASSWORD and SEED_ADMIN_EMAIL. Re-running is safe: an existing user with that
// username gets the password reset and is (re-)added to the Administrator group.
//
// Refuses to run unless DB_HOST points at this machine, so it can't touch a shared or
// deployed database.
import { hashPassword, validatePasswordStrength } from '../api/handlers/auth-handlers';
import { prisma } from '../database/mysql-database';
import { ADMINISTRATOR_GROUP_NAME, syncPermissionCatalog } from '../database/sync-permission-catalog';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export type SeedDevAdminOptions = {
	username: string;
	password: string;
	email: string;
};

export function isLocalDbHost(host: string | undefined): boolean {
	return host !== undefined && LOCAL_HOSTS.has(host.trim().toLowerCase());
}

export async function seedDevAdmin({ username, password, email }: SeedDevAdminOptions) {
	const passwordError = validatePasswordStrength(password);
	if (passwordError) {
		throw new Error(`SEED_ADMIN_PASSWORD is too weak: ${passwordError}`);
	}

	// Make sure the catalog (and any keys added since the last migration) is in the DB first.
	await syncPermissionCatalog();

	const administrator = await prisma.permissionGroup.findUnique({
		where: { name: ADMINISTRATOR_GROUP_NAME },
		select: { id: true },
	});
	if (!administrator) {
		throw new Error(
			`The "${ADMINISTRATOR_GROUP_NAME}" permission group is missing. Run the migrations first (bun run db:deploy).`
		);
	}

	const pass = await hashPassword(password);

	return prisma.$transaction(async (tx) => {
		let user = await tx.user.findFirst({ where: { username }, select: { id: true } });
		const created = !user;

		if (user) {
			await tx.user.update({ where: { id: user.id }, data: { pass, must_change_password: false } });
		} else {
			const contact = await tx.contact.upsert({
				where: { email },
				create: { first_name: 'Dev', last_name: 'Admin', email },
				update: {},
			});
			user = await tx.user.create({
				data: { username, pass, must_change_password: false, contactId: contact.id },
				select: { id: true },
			});
		}

		await tx.userPermissionGroup.createMany({
			data: [{ userId: user.id, permissionGroupId: administrator.id }],
			skipDuplicates: true,
		});

		return { userId: user.id, created };
	});
}

if (import.meta.main) {
	const host = process.env.DB_HOST;
	if (!isLocalDbHost(host)) {
		console.error(
			`Refusing to seed: DB_HOST is "${host ?? ''}", not a local database. This script is for local development only.`
		);
		process.exit(1);
	}

	const options: SeedDevAdminOptions = {
		username: process.env.SEED_ADMIN_USERNAME || 'dev',
		password: process.env.SEED_ADMIN_PASSWORD || 'Password1',
		email: process.env.SEED_ADMIN_EMAIL || 'dev-admin@libre-train.local',
	};

	try {
		const { userId, created } = await seedDevAdmin(options);
		console.log(
			`${created ? 'Created' : 'Updated'} local admin "${options.username}" (user id ${userId}) in the Administrator group.`
		);
		console.log(
			`Sign in with username "${options.username}" and the password from SEED_ADMIN_PASSWORD (default: Password1).`
		);
	} catch (error) {
		console.error('Failed to seed the local admin user:', error instanceof Error ? error.message : error);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
	}
}
