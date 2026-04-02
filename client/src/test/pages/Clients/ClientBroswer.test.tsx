import type { ClientContact } from '@libre-train/shared';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext, type AppState } from '../../../app-context';
import { ClientBrowser } from '../../../pages/clients/ClientBrowser';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

const makeClient = (overrides: Partial<ClientContact>): ClientContact => ({
	id: 1,
	created_at: new Date('2025-01-01'),
	updated_at: new Date('2025-01-01'),
	first_name: 'Default',
	last_name: 'Client',
	date_of_birth: '1990-01-01',
	img: undefined,
	height: 180,
	notes: '',
	email: 'default@example.com',
	phone: '111-1111',
	contact_id: 10,
	...overrides,
});

const defaultClients: ClientContact[] = [
	makeClient({
		id: 101,
		first_name: 'Alice',
		last_name: 'Anderson',
		email: 'alice@example.com',
		phone: '555-1111',
	}),
	makeClient({
		id: 202,
		first_name: 'Bob',
		last_name: 'Baker',
		email: 'bob@example.com',
		phone: '555-2222',
	}),
];

const createState = (clients: ClientContact[]): AppState => ({
	clients,
	assessmentTypes: [],
	auth: {
		authToken: undefined,
		user: 1,
	},
});

const renderClientBrowser = (clients: ClientContact[] = defaultClients) => {
	return render(
		<MemoryRouter>
			<AppContext.Provider
				value={{
					state: createState(clients),
					setState: vi.fn(),
					setAuth: vi.fn(),
				}}
			>
				<ClientBrowser />
			</AppContext.Provider>
		</MemoryRouter>
	);
};

describe('ClientBrowser', () => {
	beforeEach(() => {
		mockNavigate.mockReset();
	});

	it('renders page title and total client count', () => {
		renderClientBrowser();

		expect(screen.getByRole('heading', { name: 'Client Browser' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /2 Clients/i })).toBeInTheDocument();
	});

	it('filters clients by search text', async () => {
		const user = userEvent.setup();
		renderClientBrowser();

		const searchInput = screen.getByPlaceholderText('Search clients...');
		await user.type(searchInput, 'alice');

		expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
		expect(screen.queryByText('Bob Baker')).not.toBeInTheDocument();
	});

	it('navigates to create-client page when Add Client is clicked', async () => {
		const user = userEvent.setup();
		renderClientBrowser();

		await user.click(screen.getByRole('button', { name: /Add Client/i }));

		expect(mockNavigate).toHaveBeenCalledWith('/clients/create');
	});

	it('navigates to the selected client details from row action', async () => {
		const user = userEvent.setup();
		renderClientBrowser();

		const aliceRow = screen.getByRole('row', { name: /Alice Anderson/i });
		await user.click(within(aliceRow).getByRole('button', { name: /View Details/i }));

		expect(mockNavigate).toHaveBeenCalledWith('/clients/101');
	});

	it('shows empty-state message when there are no clients', () => {
		renderClientBrowser([]);

		expect(screen.getByRole('heading', { name: /0 Clients/i })).toBeInTheDocument();
		expect(screen.getByText('No clients yet')).toBeInTheDocument();
	});

	it('shows no-match message when search returns zero results', async () => {
		const user = userEvent.setup();
		renderClientBrowser();

		await user.type(screen.getByPlaceholderText('Search clients...'), 'not-a-real-client');

		expect(screen.getByText('No clients match your search')).toBeInTheDocument();
		expect(screen.queryByText('Alice Anderson')).not.toBeInTheDocument();
		expect(screen.queryByText('Bob Baker')).not.toBeInTheDocument();
	});
});
