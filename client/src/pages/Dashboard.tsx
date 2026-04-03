import {
	AlertOutlined,
	ArrowRightOutlined,
	CalendarOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	ExclamationCircleOutlined,
	MailOutlined,
	RiseOutlined,
	TeamOutlined,
	UserAddOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Divider, List, Progress, Row, Space, Tag, theme, Typography } from 'antd';
import { useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../app-context';
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

const getInitials = (firstName?: string, lastName?: string) => {
	const first = firstName?.trim().charAt(0) ?? '';
	const last = lastName?.trim().charAt(0) ?? '';
	return `${first}${last}`.toUpperCase() || 'CL';
};

const getReadableDate = (date: Date | string | undefined) => {
	if (!date) {
		return 'No date';
	}

	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) {
		return 'No date';
	}

	return parsed.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export function Dashboard() {
	const { token } = theme.useToken();
	const navigate = useNavigate();
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
			description: 'Analyze client progress and today’s key coaching priorities.',
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
				<Card
					bordered={false}
					style={{
						background: `linear-gradient(135deg, ${token.colorPrimaryBgHover}, ${token.colorBgContainer})`,
						borderRadius: 20,
						border: `1px solid ${token.colorBorderSecondary}`,
					}}
				>
					<Row align="middle" justify="space-between" gutter={[20, 20]}>
						<Col xs={24} md={16}>
							<Space direction="vertical" size={10}>
								<Typography.Title level={2} style={{ margin: 0 }}>
									Your Coaching Command Center
								</Typography.Title>
								<Typography.Text type="secondary" style={{ fontSize: 15 }}>
									Track clients, monitor profile readiness, and move quickly between planning and execution.
								</Typography.Text>
							</Space>
						</Col>
						<Col xs={24} md={8}>
							<Card
								size="small"
								style={{
									borderRadius: 14,
									background: token.colorBgElevated,
									border: `1px solid ${token.colorBorderSecondary}`,
								}}
							>
								<Space direction="vertical" size={4} style={{ width: '100%' }}>
									<Typography.Text type="secondary">Profile Completeness</Typography.Text>
									<Progress
										percent={profileCompletion}
										strokeColor={token.colorPrimary}
										trailColor={token.colorFillTertiary}
										status="active"
									/>
									<Typography.Text type="secondary" style={{ fontSize: 12 }}>
										{clientsWithEmail} of {totalClients} client profiles include email contact data.
									</Typography.Text>
								</Space>
							</Card>
						</Col>
					</Row>
				</Card>

				<Row gutter={[16, 16]}>
					<Col xs={24} md={8}>
						<Card bordered={false} style={{ borderRadius: 16, height: '100%' }}>
							<Space direction="vertical" size={6}>
								<TeamOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
								<Typography.Text type="secondary">Active Clients</Typography.Text>
								<Typography.Title level={3} style={{ margin: 0 }}>
									{totalClients}
								</Typography.Title>
							</Space>
						</Card>
					</Col>
					<Col xs={24} md={8}>
						<Card bordered={false} style={{ borderRadius: 16, height: '100%' }}>
							<Space direction="vertical" size={6}>
								<RiseOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
								<Typography.Text type="secondary">Exercise Library</Typography.Text>
								<Typography.Title level={3} style={{ margin: 0 }}>
									{totalExercises}
								</Typography.Title>
							</Space>
						</Card>
					</Col>
					<Col xs={24} md={8}>
						<Card bordered={false} style={{ borderRadius: 16, height: '100%' }}>
							<Space direction="vertical" size={6}>
								<CalendarOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
								<Typography.Text type="secondary">Assessment Metrics</Typography.Text>
								<Typography.Title level={3} style={{ margin: 0 }}>
									{totalAssessmentTypes}
								</Typography.Title>
							</Space>
						</Card>
					</Col>
				</Row>

				<Row gutter={[16, 16]}>
					<Col xs={24} lg={14}>
						<Card bordered={false} title="Recently Added Clients" style={{ borderRadius: 16, height: '100%' }}>
							{recentClients.length === 0 ? (
								<Typography.Text type="secondary">
									No clients yet. Start by creating your first client profile.
								</Typography.Text>
							) : (
								<List
									dataSource={recentClients}
									renderItem={(client) => (
										<List.Item
											actions={[
												<Button
													key="view-client-dashboard"
													type="link"
													onClick={() => navigate('/clients/')}
												>
													View Dashboard
												</Button>,
												<Button
													key="message-client"
													type="link"
													onClick={() =>
														handleMockAction(
															`Message drafted for ${client.first_name} ${client.last_name}.`
														)
													}
												>
													Message
												</Button>,
											]}
										>
											<List.Item.Meta
												avatar={<Avatar>{getInitials(client.first_name, client.last_name)}</Avatar>}
												title={`${client.first_name} ${client.last_name}`}
												description={
													<Space split={<Divider type="vertical" />} size={4}>
														<span>{client.email || 'No email on file'}</span>
														<span>Joined {getReadableDate(client.created_at)}</span>
													</Space>
												}
											/>
										</List.Item>
									)}
								/>
							)}
						</Card>
					</Col>

					<Col xs={24} lg={10}>
						<Space direction="vertical" size={16} style={{ width: '100%' }}>
							<Card bordered={false} title="Quick Actions" style={{ borderRadius: 16 }}>
								<Space direction="vertical" size={12} style={{ width: '100%' }}>
									{actions.map((action) => (
										<Card
											key={action.title}
											size="small"
											style={{
												background: token.colorBgElevated,
												borderRadius: 12,
												border: `1px solid ${token.colorBorderSecondary}`,
											}}
										>
											<Space direction="vertical" size={6} style={{ width: '100%' }}>
												<Space>
													<Tag color="green" style={{ marginInlineEnd: 0 }}>
														{action.icon}
													</Tag>
													<Typography.Text strong>{action.title}</Typography.Text>
												</Space>
												<Typography.Text type="secondary">{action.description}</Typography.Text>
												<Button
													type="link"
													onClick={() => navigate(action.path)}
													style={{ paddingInline: 0 }}
												>
													{action.cta} <ArrowRightOutlined />
												</Button>
											</Space>
										</Card>
									))}
								</Space>
							</Card>

							<Card bordered={false} style={{ borderRadius: 16 }}>
								<Space direction="vertical" size={4}>
									<Typography.Text type="secondary">Focus Today</Typography.Text>
									<Typography.Title level={4} style={{ margin: 0 }}>
										Keep client plans and logs current
									</Typography.Title>
									<Typography.Text type="secondary">
										A quick daily update across assessments, routines, and nutrition logs improves coaching
										quality and client retention.
									</Typography.Text>
								</Space>
							</Card>
						</Space>
					</Col>
				</Row>

				<Row gutter={[16, 16]}>
					<Col xs={24} lg={8}>
						<Card bordered={false} title="Today's Appointments" style={{ borderRadius: 16, height: '100%' }}>
							<List
								dataSource={mockAppointments}
								renderItem={(appointment) => (
									<List.Item
										key={appointment.id}
										actions={[
											<Button
												key="mark-complete"
												type="link"
												icon={<CheckCircleOutlined />}
												onClick={() =>
													handleMockAction(`${appointment.clientName} session marked complete.`)
												}
											>
												Complete
											</Button>,
											<Button
												key="send-reminder"
												type="link"
												icon={<MailOutlined />}
												onClick={() => handleMockAction(`Reminder sent to ${appointment.clientName}.`)}
											>
												Reminder
											</Button>,
										]}
									>
										<List.Item.Meta
											avatar={<ClockCircleOutlined style={{ color: token.colorPrimary }} />}
											title={appointment.clientName}
											description={
												<Space direction="vertical" size={2}>
													<Typography.Text type="secondary">{appointment.time}</Typography.Text>
													<Typography.Text type="secondary">{appointment.focus}</Typography.Text>
													<Tag color={appointment.status === 'confirmed' ? 'green' : 'gold'}>
														{appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
													</Tag>
												</Space>
											}
										/>
									</List.Item>
								)}
							/>
						</Card>
					</Col>

					<Col xs={24} lg={8}>
						<Card bordered={false} title="Check-ins Needing Attention" style={{ borderRadius: 16, height: '100%' }}>
							<List
								dataSource={mockCheckIns}
								renderItem={(checkIn) => {
									const riskColor =
										checkIn.risk === 'high' ? 'red' : checkIn.risk === 'medium' ? 'gold' : 'green';
									return (
										<List.Item
											key={checkIn.id}
											actions={[
												<Button
													key="follow-up"
													type="link"
													onClick={() =>
														handleMockAction(`Follow-up task created for ${checkIn.clientName}.`)
													}
												>
													Follow-up
												</Button>,
											]}
										>
											<List.Item.Meta
												avatar={<AlertOutlined style={{ color: token.colorWarning }} />}
												title={checkIn.clientName}
												description={
													<Space direction="vertical" size={2}>
														<Typography.Text type="secondary">
															Last update: {checkIn.lastCheckIn}
														</Typography.Text>
														<Typography.Text type="secondary">{checkIn.note}</Typography.Text>
														<Tag color={riskColor}>{checkIn.risk.toUpperCase()} PRIORITY</Tag>
													</Space>
												}
											/>
										</List.Item>
									);
								}}
							/>
						</Card>
					</Col>

					<Col xs={24} lg={8}>
						<Card
							bordered={false}
							title="Clients Missing Training Plan"
							extra={<Tag color="red">{clientsMissingPlans.length} Unprogrammed</Tag>}
							style={{ borderRadius: 16, height: '100%' }}
						>
							{clientsMissingPlans.length === 0 ? (
								<Typography.Text type="secondary">All clients have active programming.</Typography.Text>
							) : (
								<List
									dataSource={clientsMissingPlans}
									renderItem={(client) => (
										<List.Item
											key={client.id}
											actions={[
												<Button
													key="create-plan"
													type="link"
													onClick={() =>
														handleMockAction(`Plan builder opened for ${client.clientName} (mock).`)
													}
												>
													Create Plan
												</Button>,
												<Button
													key="notify-client"
													type="link"
													onClick={() =>
														handleMockAction(`Plan update notice sent to ${client.clientName}.`)
													}
												>
													Notify
												</Button>,
											]}
										>
											<List.Item.Meta
												avatar={<ExclamationCircleOutlined style={{ color: token.colorError }} />}
												title={client.clientName}
												description={
													<Space direction="vertical" size={2}>
														<Typography.Text type="secondary">
															Status: No active plan programmed
														</Typography.Text>
														<Tag color={client.priority === 'high' ? 'red' : 'default'}>
															{client.priority === 'high' ? 'HIGH PRIORITY' : 'NORMAL PRIORITY'}
														</Tag>
													</Space>
												}
											/>
										</List.Item>
									)}
								/>
							)}
						</Card>
					</Col>
				</Row>
			</Space>
		</PageLayout>
	);
}
