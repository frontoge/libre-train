type QueryRow = Record<string, unknown>;

export const getRows = <TRow extends QueryRow = QueryRow>(result: unknown): TRow[] => {
	if (!Array.isArray(result)) {
		return [];
	}

	const [first] = result;
	if (Array.isArray(first)) {
		return first as TRow[];
	}

	return result as TRow[];
};
