import type { ClientContact } from '@libre-train/shared';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext, type AppState } from '../../app-context';
import { Dashboard } from '../../pages/Dashboard';

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
	created_at: new Date('2026-03-01'),
	updated_at: new Date('2026-03-01'),
	first_name: 'Default',
	last_name: 'Client',
	date_of_birth: '1990-01-01',
	img: undefined,
	height: 180,
	notes: '',
	email: 'default@example.com',
	phone: '111-1111',
	contact_id: 1,
	...overrides,
});

const defaultClients: ClientContact[] = [
	makeClient({
		id: 101,
		first_name: 'Alice',
		last_name: 'Anderson',
		email: 'alice@example.com',
		created_at: new Date('2026-03-04'),
	}),
	makeClient({
		id: 202,
		first_name: 'Bob',
		last_name: 'Baker',
		email: undefined,
		created_at: new Date('2026-03-03'),
	}),
];

const createState = (overrides?: Partial<AppState>): AppState => ({
	clients: defaultClients,
	assessmentTypes: [
		{ id: 1, name: 'Body Fat %', assessmentUnit: '%', assessmentGroupId: 1 },
		{ id: 2, name: 'Resting Heart Rate', assessmentUnit: 'bpm', assessmentGroupId: 3 },
	],
	exerciseData: [
		{
			id: 1,
			exercise_name: 'Goblet Squat',
			muscle_groups: [],
			progression_level: 1,
		},
		{
			id: 2,
			exercise_name: 'Push-Up',
			muscle_groups: [],
			progression_level: 1,
		},
	],
	showMessage: vi.fn(),
	auth: {
		authToken: undefined,
		user: 1,
	},
	...overrides,
});

const renderDashboard = (stateOverrides?: Partial<AppState>) => {
	const state = createState(stateOverrides);

	render(
		<MemoryRouter>
			<AppContext.Provider
				value={{
					state,
					setState: vi.fn(),
					setAuth: vi.fn(),
				}}
			>
				<Dashboard />
			</AppContext.Provider>
		</MemoryRouter>
	);

	return { showMessage: state.showMessage };
};

describe('Dashboard', () => {
	beforeEach(() => {
		mockNavigate.mockReset();
	});

	it('renders dashboard sections and metric values from state', () => {
		renderDashboard();

		expect(screen.getByRole('heading', { name: 'Trainer Dashboard' })).toBeInTheDocument();
		expect(screen.getByText('Your Coaching Command Center')).toBeInTheDocument();
		expect(screen.getByText('Recently Added Clients')).toBeInTheDocument();
		expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
		expect(screen.getByText('Check-ins Needing Attention')).toBeInTheDocument();
		expect(screen.getByText('Clients Missing Training Plan')).toBeInTheDocument();

		expect(screen.getAllByRole('heading', { name: '2' })).toHaveLength(3);
		expect(screen.getByText('1 of 2 client profiles include email contact data.')).toBeInTheDocument();
		expect(screen.getByText('2 Unprogrammed')).toBeInTheDocument();
	});

	it('shows empty-state messaging when there are no clients', () => {
		renderDashboard({ clients: [] });

		expect(screen.getByText('No clients yet. Start by creating your first client profile.')).toBeInTheDocument();
		expect(screen.getByText('0 of 0 client profiles include email contact data.')).toBeInTheDocument();
	});

	it('shows profile completion percentages for 0%, 50%, and 100% scenarios', () => {
		renderDashboard({ clients: [] });
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

		renderDashboard({
			clients: [
				makeClient({ id: 1, first_name: 'Alpha', last_name: 'One', email: 'alpha@example.com' }),
				makeClient({ id: 2, first_name: 'Beta', last_name: 'Two', email: undefined }),
			],
		});
		expect(screen.getAllByRole('progressbar')[1]).toHaveAttribute('aria-valuenow', '50');

		renderDashboard({
			clients: [
				makeClient({ id: 3, first_name: 'Gamma', last_name: 'Three', email: 'gamma@example.com' }),
				makeClient({ id: 4, first_name: 'Delta', last_name: 'Four', email: 'delta@example.com' }),
			],
		});
		expect(screen.getAllByRole('progressbar')[2]).toHaveAttribute('aria-valuenow', '100');
	});

	it('navigates from quick action buttons', async () => {
		const user = userEvent.setup();
		renderDashboard();

		await user.click(screen.getByRole('button', { name: /Create Client/i }));
		expect(mockNavigate).toHaveBeenCalledWith('/clients/create');

		await user.click(screen.getByRole('button', { name: /Open Dashboards/i }));
		expect(mockNavigate).toHaveBeenCalledWith('/clients/');
	});

	it('navigates when clicking recent client dashboard action', async () => {
		const user = userEvent.setup();
		renderDashboard();

		await user.click(screen.getAllByRole('button', { name: 'View Dashboard' })[0]);

		expect(mockNavigate).toHaveBeenCalledWith('/clients/');
	});

	it('calls showMessage for interactive mock actions', async () => {
		const user = userEvent.setup();
		const { showMessage } = renderDashboard();

		await user.click(screen.getAllByText('Complete')[0]);
		expect(showMessage).toHaveBeenCalledWith('info', 'Maya Patel session marked complete.');

		await user.click(screen.getAllByText('Follow-up')[0]);
		expect(showMessage).toHaveBeenCalledWith('info', 'Follow-up task created for Sofia Kim.');

		await user.click(screen.getAllByText('Create Plan')[0]);
		expect(showMessage).toHaveBeenCalledWith('info', 'Plan builder opened for Jordan Rivers (mock).');
	});
});
