import { getAppConfiguration } from '../config/app.config';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions<TBody = unknown> = {
	method?: HttpMethod;
	body?: TBody;
	searchParams?: Record<string, unknown>;
	credentials?: RequestCredentials;
	errorMessage?: string;
	errorKeys?: ReadonlyArray<string>;
};

const DEFAULT_ERROR_KEYS = ['message', 'errorMessage', 'error'] as const;

export function createSearchParams(obj: Record<string, unknown>): URLSearchParams {
	const params = new URLSearchParams();

	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null) {
			params.append(key, String(value));
		}
	}

	return params;
}

async function readErrorMessage(response: Response, fallback: string, keys: ReadonlyArray<string>): Promise<string> {
	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		// body is not JSON; fall through
	}

	if (body && typeof body === 'object') {
		for (const key of keys) {
			const value = (body as Record<string, unknown>)[key];
			if (typeof value === 'string' && value.length > 0) return value;
		}
	}

	return fallback;
}

export async function apiFetch<TResponse, TBody = unknown>(
	path: string,
	options: ApiRequestOptions<TBody> = {}
): Promise<TResponse> {
	const {
		method = 'GET',
		body,
		searchParams,
		credentials,
		errorMessage = `Request failed: ${method} ${path}`,
		errorKeys = DEFAULT_ERROR_KEYS,
	} = options;

	const baseUrl = `${getAppConfiguration().apiUrl}${path}`;
	const url = searchParams ? `${baseUrl}?${createSearchParams(searchParams)}` : baseUrl;

	const init: RequestInit = {
		method,
		headers: { 'Content-Type': 'application/json' },
	};
	if (body !== undefined) init.body = JSON.stringify(body);
	if (credentials) init.credentials = credentials;

	const response = await fetch(url, init);

	if (!response.ok) {
		throw new Error(await readErrorMessage(response, errorMessage, errorKeys));
	}

	try {
		return (await response.json()) as TResponse;
	} catch {
		return undefined as TResponse;
	}
}
