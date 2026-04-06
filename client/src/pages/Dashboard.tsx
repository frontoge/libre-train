import { CalendarOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { Col, Row, Space } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../app-context';
import {
	CheckInsCard,
	ClientsMissingPlanCard,
	DashboardHeader,
	DashboardStats,
	FocusTodayCard,
	QuickActionsCard,
	RecentClientsCard,
	TodaysAppointmentsCard,
} from '../components/Dashboard';
import PageLayout from '../components/PageLayout';
import { getTrainerCheckIns, getTrainerMissingPlans } from '../helpers/dashboard-helpers';
import { useAuth } from '../hooks/useAuth';
import { useMessage } from '../hooks/useMessage';
import type { CheckIn, TrainingPlanStatus } from '../types/types';

type DashboardAction = {
	title: string;
	description: string;
	cta: string;
	path: string;
	icon: React.ReactNode;
};

type Appointment = {
	id: number;
	clientName: string;
	time: string;
	focus: string;
	status: 'confirmed' | 'pending';
};

const mockAppointments: Appointment[] = [
	{ id: 1, clientName: 'Maya Patel', time: '8:00 AM', focus: 'Lower body strength', status: 'confirmed' },
	{ id: 2, clientName: 'Jordan Rivers', time: '10:30 AM', focus: 'Conditioning + mobility', status: 'pending' },
	{ id: 3, clientName: 'Evan Brooks', time: '2:00 PM', focus: 'Hypertrophy progression', status: 'confirmed' },
];

export function Dashboard() {
	const { state } = useContext(AppContext);
	const { user } = useAuth();
	const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
	const [missingPlans, setMissingPlans] = useState<TrainingPlanStatus[]>([]);
	const showMessage = useMessage();

	const handleMockAction = (message: string) => {
		showMessage('info', message);
	};

	const totalClients = state.clients.length;
	const totalExercises = state.exerciseData?.length ?? 0;
	const totalAssessmentTypes = state.assessmentTypes.length;

	const clientsWithTasksRemaining = useMemo(() => {
		const clientIds = new Set<number>();
		checkIns.forEach((checkIn) => clientIds.add(checkIn.id));
		missingPlans.forEach((client) => clientIds.add(client.id));
		return clientIds.size;
	}, [checkIns, missingPlans]);

	const taskProgressPercent =
		totalClients === 0 ? 100 : Math.round(((totalClients - clientsWithTasksRemaining) / totalClients) * 100);

	const recentClients = useMemo(() => {
		return [...state.clients]
			.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return dateB - dateA;
			})
			.slice(0, 5);
	}, [state.clients]);

	const actions: DashboardAction[] = [
		{
			title: 'Add New Client',
			description: 'Start onboarding a new client and capture baseline details.',
			cta: 'Create Client',
			path: '/clients/create',
			icon: <UserAddOutlined />,
		},
		{
			title: 'Review Client Dashboards',
			description: "Analyze client progress and today's key coaching priorities.",
			cta: 'Open Dashboards',
			path: '/clients/',
			icon: <TeamOutlined />,
		},
		{
			title: 'Build Training Plan',
			description: 'Build or update routines to keep your clients on track.',
			cta: 'Manage Plans',
			path: '/training/',
			icon: <CalendarOutlined />,
		},
	];

	const fetchDashboardData = async () => {
		if (!user) {
			return;
		}

		const results = await Promise.all([getTrainerCheckIns(user), getTrainerMissingPlans(user)]);
		setCheckIns(results[0]);
		setMissingPlans(results[1]);
	};

	useEffect(() => {
		// Fetch check in data
		fetchDashboardData();
	}, []);

	return (
		<PageLayout
			title="Trainer Dashboard"
			style={{
				height: '100%',
				overflow: 'auto',
				padding: '1.75rem 2rem',
			}}
		>
			<Space orientation="vertical" size={20} style={{ width: '100%' }}>
				<DashboardHeader
					taskProgressPercent={taskProgressPercent}
					clientsWithTasksRemaining={clientsWithTasksRemaining}
					totalClients={totalClients}
				/>

				<DashboardStats
					totalClients={totalClients}
					totalExercises={totalExercises}
					totalAssessmentTypes={totalAssessmentTypes}
				/>

				<Row gutter={[16, 16]}>
					<Col xs={24} lg={14}>
						<RecentClientsCard
							clients={recentClients}
							onMessage={(clientName) => handleMockAction(`Message drafted for ${clientName}.`)}
						/>
					</Col>

					<Col xs={24} lg={10}>
						<Space orientation="vertical" size={16} style={{ width: '100%' }}>
							<QuickActionsCard actions={actions} />
							<FocusTodayCard />
						</Space>
					</Col>
				</Row>

				<Row gutter={[16, 16]}>
					<Col xs={24} lg={8}>
						<TodaysAppointmentsCard
							appointments={mockAppointments}
							onMarkComplete={(clientName) => handleMockAction(`${clientName} session marked complete.`)}
							onSendReminder={(clientName) => handleMockAction(`Reminder sent to ${clientName}.`)}
						/>
					</Col>

					<Col xs={24} lg={8}>
						<CheckInsCard
							checkIns={checkIns}
							onFollowUp={(clientName) => handleMockAction(`Follow-up task created for ${clientName}.`)}
						/>
					</Col>

					<Col xs={24} lg={8}>
						<ClientsMissingPlanCard
							clients={missingPlans}
							onCreatePlan={(clientName) => handleMockAction(`Plan builder opened for ${clientName} (mock).`)}
							onNotifyClient={(clientName) => handleMockAction(`Plan update notice sent to ${clientName}.`)}
						/>
					</Col>
				</Row>
			</Space>
		</PageLayout>
	);
}
