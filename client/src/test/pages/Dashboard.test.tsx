import type { ClientContact } from '@libre-train/shared';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppContext, type AppState } from '../../app-context';
import { getTrainerCheckIns, getTrainerMissingPlans } from '../../helpers/dashboard-helpers';
import { Dashboard } from '../../pages/Dashboard';
import type { CheckIn, TrainingPlanStatus } from '../../types/types';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

// Mock data-fetching layer so api.ts (and its @libre-train/shared imports) are never loaded
vi.mock('../../helpers/dashboard-helpers', () => ({
	getTrainerCheckIns: vi.fn(),
	getTrainerMissingPlans: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
	useAuth: vi.fn().mockReturnValue({ user: 1 }),
}));

const mockCheckIns: CheckIn[] = [
	{
		id: 101,
		clientName: 'Sofia Kim',
		lastCheckIn: '0 day(s) ago',
		note: 'No diet log today',
		risk: 'medium',
	},
];

const mockMissingPlans: TrainingPlanStatus[] = [
	{
		id: 202,
		clientName: 'Jordan Rivers',
		priority: 'high',
	},
];

const makeClient = (overrides: Partial<ClientContact>): ClientContact => ({
	ClientId: 1,
	ContactId: 1,
	trainerId: 1,
	first_name: 'Default',
	last_name: 'Client',
	date_of_birth: '1990-01-01',
	img: undefined,
	height: 180,
	notes: '',
	email: 'default@example.com',
	phone: '111-1111',
	...overrides,
});

const defaultClients: ClientContact[] = [
	makeClient({
		ClientId: 101,
		ContactId: 1001,
		trainerId: 1,
		first_name: 'Alice',
		last_name: 'Anderson',
		email: 'alice@example.com',
	}),
	makeClient({
		ClientId: 202,
		ContactId: 2001,
		trainerId: 1,
		first_name: 'Bob',
		last_name: 'Baker',
		email: undefined,
	}),
];

const createState = (overrides?: Partial<AppState>): AppState => ({
	clients: defaultClients,
	assessmentTypes: [
		{
			id: 1,
			name: 'Body Fat %',
			assessmentUnit: '%',
			assessmentGroupId: 1,
			created_at: '2026-03-01 00:00:00',
			updated_at: '2026-03-01 00:00:00',
		},
		{
			id: 2,
			name: 'Resting Heart Rate',
			assessmentUnit: 'bpm',
			assessmentGroupId: 3,
			created_at: '2026-03-01 00:00:00',
			updated_at: '2026-03-01 00:00:00',
		},
	],
	exerciseData: [
		{
			id: 1,
			exercise_name: 'Goblet Squat',
			muscle_groups: [],
			progression_level: 1,
			created_at: '2026-03-01 00:00:00',
			updated_at: '2026-03-01 00:00:00',
		},
		{
			id: 2,
			exercise_name: 'Push-Up',
			muscle_groups: [],
			progression_level: 1,
			created_at: '2026-03-01 00:00:00',
			updated_at: '2026-03-01 00:00:00',
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
		vi.mocked(getTrainerCheckIns).mockResolvedValue([]);
		vi.mocked(getTrainerMissingPlans).mockResolvedValue([]);
	});

	it('renders dashboard sections and metric values from state', async () => {
		vi.mocked(getTrainerCheckIns).mockResolvedValue(mockCheckIns);
		vi.mocked(getTrainerMissingPlans).mockResolvedValue(mockMissingPlans);

		renderDashboard();

		expect(screen.getByRole('heading', { name: 'Trainer Dashboard' })).toBeInTheDocument();
		expect(screen.getByText('Your Coaching Command Center')).toBeInTheDocument();
		expect(screen.getByText('Recently Added Clients')).toBeInTheDocument();
		expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
		expect(screen.getByText('Check-ins Needing Attention')).toBeInTheDocument();
		expect(screen.getByText('Clients Missing Training Plan')).toBeInTheDocument();

		expect(screen.getAllByRole('heading', { name: '2' })).toHaveLength(3);

		await waitFor(() => {
			expect(screen.getByText('2 of 2 clients still need follow-up action.')).toBeInTheDocument();
			expect(screen.getByText('1 Unprogrammed')).toBeInTheDocument();
		});
	});

	it('shows empty-state messaging when there are no clients', async () => {
		renderDashboard({ clients: [] });

		expect(screen.getByText('No clients yet. Start by creating your first client profile.')).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText('0 of 0 clients still need follow-up action.')).toBeInTheDocument();
		});
	});

	it('shows 100% task completion when no clients have outstanding tasks', async () => {
		renderDashboard();

		await waitFor(() => {
			expect(screen.getAllByRole('progressbar')[0]).toHaveAttribute('aria-valuenow', '100');
		});
	});

	it('shows 0% task completion when all clients have outstanding tasks', async () => {
		vi.mocked(getTrainerMissingPlans).mockResolvedValue([
			{ id: 101, clientName: 'Alice Anderson', priority: 'high' },
			{ id: 202, clientName: 'Bob Baker', priority: 'high' },
		]);

		renderDashboard();

		await waitFor(() => {
			expect(screen.getAllByRole('progressbar')[0]).toHaveAttribute('aria-valuenow', '0');
		});
	});

	it('shows 50% task completion when half of clients have outstanding tasks', async () => {
		vi.mocked(getTrainerMissingPlans).mockResolvedValue([{ id: 101, clientName: 'Alice Anderson', priority: 'high' }]);

		renderDashboard();

		await waitFor(() => {
			expect(screen.getAllByRole('progressbar')[0]).toHaveAttribute('aria-valuenow', '50');
		});
	});

	it('navigates from quick action buttons', async () => {
		renderDashboard();

		await waitFor(() => {
			expect(getTrainerCheckIns).toHaveBeenCalledWith(1);
			expect(getTrainerMissingPlans).toHaveBeenCalledWith(1);
		});

		const quickActionsCard = screen.getByText('Quick Actions').closest('.ant-card');
		expect(quickActionsCard).toBeInstanceOf(HTMLElement);

		const quickActions = within(quickActionsCard as HTMLElement);

		fireEvent.click(quickActions.getByText('Create Client'));
		expect(mockNavigate).toHaveBeenCalledWith('/clients/create');

		fireEvent.click(quickActions.getByText('Open Dashboards'));
		expect(mockNavigate).toHaveBeenCalledWith('/clients/');
	});

	it('navigates when clicking recent client dashboard action', async () => {
		const user = userEvent.setup();
		renderDashboard();

		await user.click(screen.getAllByRole('button', { name: 'View Dashboard' })[0]);

		expect(mockNavigate).toHaveBeenCalledWith('/clients/');
	});

	it('calls showMessage for interactive mock actions', async () => {
		vi.mocked(getTrainerCheckIns).mockResolvedValue(mockCheckIns);
		vi.mocked(getTrainerMissingPlans).mockResolvedValue(mockMissingPlans);

		const user = userEvent.setup();
		const { showMessage } = renderDashboard();

		await user.click(screen.getAllByText('Complete')[0]);
		expect(showMessage).toHaveBeenCalledWith('info', 'Maya Patel session marked complete.');

		await user.click(await screen.findByText('Follow-up'));
		expect(showMessage).toHaveBeenCalledWith('info', 'Follow-up task created for Sofia Kim.');

		await user.click(await screen.findByText('Create Plan'));
		expect(showMessage).toHaveBeenCalledWith('info', 'Plan builder opened for Jordan Rivers (mock).');
	});
});
