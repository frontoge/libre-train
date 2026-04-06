import { CalendarOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { Col, Row, Space } from 'antd';
import { useContext, useMemo } from 'react';
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

type CheckIn = {
	id: number;
	clientName: string;
	lastCheckIn: string;
	note: string;
	risk: 'low' | 'medium' | 'high';
};

type TrainingPlanStatus = {
	id: number;
	clientName: string;
	hasPlan: boolean;
	priority: 'normal' | 'high';
	lastUpdated: string;
};

const mockAppointments: Appointment[] = [
	{ id: 1, clientName: 'Maya Patel', time: '8:00 AM', focus: 'Lower body strength', status: 'confirmed' },
	{ id: 2, clientName: 'Jordan Rivers', time: '10:30 AM', focus: 'Conditioning + mobility', status: 'pending' },
	{ id: 3, clientName: 'Evan Brooks', time: '2:00 PM', focus: 'Hypertrophy progression', status: 'confirmed' },
];

const mockCheckIns: CheckIn[] = [
	{ id: 1, clientName: 'Sofia Kim', lastCheckIn: '3 days ago', note: 'Missed two sessions this week', risk: 'high' },
	{ id: 2, clientName: 'Noah Ellis', lastCheckIn: '2 days ago', note: 'Recovery fatigue reported', risk: 'medium' },
	{ id: 3, clientName: 'Ava Turner', lastCheckIn: 'Today', note: 'Nutrition targets hit for 5 days', risk: 'low' },
];

const mockTrainingPlanStatus: TrainingPlanStatus[] = [
	{ id: 1, clientName: 'Maya Patel', hasPlan: true, priority: 'normal', lastUpdated: 'Apr 1' },
	{ id: 2, clientName: 'Jordan Rivers', hasPlan: false, priority: 'high', lastUpdated: 'No plan yet' },
	{ id: 3, clientName: 'Evan Brooks', hasPlan: true, priority: 'normal', lastUpdated: 'Apr 2' },
	{ id: 4, clientName: 'Sofia Kim', hasPlan: false, priority: 'high', lastUpdated: 'No plan yet' },
];

export function Dashboard() {
	const { state } = useContext(AppContext);

	const handleMockAction = (message: string) => {
		state.showMessage('info', message);
	};

	const totalClients = state.clients.length;
	const totalExercises = state.exerciseData?.length ?? 0;
	const totalAssessmentTypes = state.assessmentTypes.length;

	const clientsWithEmail = useMemo(() => state.clients.filter((client) => Boolean(client.email)).length, [state.clients]);

	const recentClients = useMemo(() => {
		return [...state.clients]
			.sort((a, b) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();
				return dateB - dateA;
			})
			.slice(0, 5);
	}, [state.clients]);

	const profileCompletion = totalClients === 0 ? 0 : Math.round((clientsWithEmail / totalClients) * 100);
	const clientsMissingPlans = useMemo(() => mockTrainingPlanStatus.filter((client) => !client.hasPlan), []);

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
			title: 'Plan Training Session',
			description: 'Build or update routines to keep your clients on track.',
			cta: 'Manage Plans',
			path: '/training/',
			icon: <CalendarOutlined />,
		},
	];

	return (
		<PageLayout
			title="Trainer Dashboard"
			style={{
				height: '100%',
				overflow: 'auto',
				padding: '1.75rem 2rem',
			}}
		>
			<Space direction="vertical" size={20} style={{ width: '100%' }}>
				<DashboardHeader
					profileCompletion={profileCompletion}
					clientsWithEmail={clientsWithEmail}
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
						<Space direction="vertical" size={16} style={{ width: '100%' }}>
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
							checkIns={mockCheckIns}
							onFollowUp={(clientName) => handleMockAction(`Follow-up task created for ${clientName}.`)}
						/>
					</Col>

					<Col xs={24} lg={8}>
						<ClientsMissingPlanCard
							clients={clientsMissingPlans}
							onCreatePlan={(clientName) => handleMockAction(`Plan builder opened for ${clientName} (mock).`)}
							onNotifyClient={(clientName) => handleMockAction(`Plan update notice sent to ${clientName}.`)}
						/>
					</Col>
				</Row>
			</Space>
		</PageLayout>
	);
}
