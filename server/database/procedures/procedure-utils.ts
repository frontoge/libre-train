export type SqlDate = Date | string;
type ProcedureRow = Record<string, unknown>;

type DbExecutor = {
	$queryRawUnsafe<T = unknown>(query: string, ...values: unknown[]): Promise<T>;
	$executeRawUnsafe(query: string, ...values: unknown[]): Promise<number>;
};

export const queryRows = <TRow extends ProcedureRow = ProcedureRow>(
	db: DbExecutor,
	sql: string,
	params: readonly unknown[] = []
): Promise<TRow[]> => db.$queryRawUnsafe<TRow[]>(sql, ...params);

export const execute = (db: DbExecutor, sql: string, params: readonly unknown[] = []) => db.$executeRawUnsafe(sql, ...params);

export const getLastInsertId = async (db: DbExecutor) => {
	const rows = await queryRows<{ id: number }>(db, 'SELECT LAST_INSERT_ID() AS id');
	return Number(rows[0]?.id ?? 0);
};

export const asDate = (value: SqlDate | null | undefined) => {
	if (!value) return null;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed;
};
