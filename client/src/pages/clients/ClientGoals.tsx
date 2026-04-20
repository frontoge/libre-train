import type { ClientGoalWithRelations } from '@libre-train/shared';
import { Alert, Button, Col, Empty, Result, Row, Space, Spin, theme, Typography } from 'antd';
import { useContext, useMemo, useState } from 'react';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../app-context';
import { GoalCard } from '../../components/Goals/GoalCard';
import { GoalModal } from '../../components/Goals/GoalModal';
import { useClientGoals } from '../../components/Goals/useClientGoals';
import PageLayout from '../../components/PageLayout';
import { deleteClientGoal } from '../../helpers/goals-api';
import { useMessage } from '../../hooks/useMessage';

const isActiveGoal = (goal: ClientGoalWithRelations): boolean => goal.status === 'planned' || goal.status === 'in_progress';

export function ClientGoals() {
	const { id } = useParams();
	const clientId = id ? parseInt(id, 10) : undefined;
	const { state } = useContext(AppContext);
	const { token } = theme.useToken();
	const navigate = useNavigate();
	const showMessage = useMessage();

	const [modalOpen, setModalOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<ClientGoalWithRelations | undefined>(undefined);

	const { goals, loading, error, refresh } = useClientGoals(clientId);

	const clientName = useMemo(() => {
		const client = state.clients.find((c) => c.ClientId === clientId);
		return client ? `${client.first_name} ${client.last_name}` : undefined;
	}, [state.clients, clientId]);

	const { present, past } = useMemo(() => {
		const present: ClientGoalWithRelations[] = [];
		const past: ClientGoalWithRelations[] = [];
		for (const goal of goals) {
			if (isActiveGoal(goal)) present.push(goal);
			else past.push(goal);
		}
		return { present, past };
	}, [goals]);

	const handleNewGoal = () => {
		setEditingGoal(undefined);
		setModalOpen(true);
	};

	const handleEdit = (goal: ClientGoalWithRelations) => {
		setEditingGoal(goal);
		setModalOpen(true);
	};

	const handleDelete = async (goal: ClientGoalWithRelations) => {
		try {
			await deleteClientGoal(goal.id);
			showMessage('success', 'Goal deleted');
			refresh();
		} catch (err) {
			showMessage('error', err instanceof Error ? err.message : 'Failed to delete goal');
		}
	};

	if (clientId === undefined || Number.isNaN(clientId)) {
		return (
			<PageLayout title="Client Goals">
				<Result status="404" title="No client selected" subTitle="Pick a client from the client list." />
			</PageLayout>
		);
	}

	const renderSection = (title: string, items: ClientGoalWithRelations[], emptyText: string) => (
		<section
			style={{
				backgroundColor: token.colorBgContainer,
				padding: 'clamp(1rem, 3vw, 1.5rem)',
				borderRadius: token.borderRadiusLG,
				border: `1px solid ${token.colorBorderSecondary}`,
				marginBottom: '1rem',
			}}
		>
			<div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
				<Typography.Title level={4} style={{ margin: 0, color: token.colorTextHeading }}>
					{title}
				</Typography.Title>
				<Typography.Text type="secondary">{items.length}</Typography.Text>
			</div>
			{items.length === 0 ? (
				<Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />
			) : (
				<Row gutter={[16, 16]}>
					{items.map((goal) => (
						<Col key={goal.id} xs={24} sm={12} lg={8} xl={6}>
							<GoalCard goal={goal} onEdit={handleEdit} onDelete={handleDelete} />
						</Col>
					))}
				</Row>
			)}
		</section>
	);

	return (
		<PageLayout title={clientName ? `Goals — ${clientName}` : 'Client Goals'}>
			<div
				style={{
					maxWidth: '1280px',
					margin: '0 auto',
					padding: 'clamp(1rem, 3vw, 1.5rem)',
					display: 'flex',
					flexDirection: 'column',
					gap: '1rem',
				}}
			>
				<div
					style={{
						backgroundColor: token.colorBgContainer,
						padding: 'clamp(1rem, 3vw, 1.5rem)',
						borderRadius: token.borderRadiusLG,
						border: `1px solid ${token.colorBorderSecondary}`,
					}}
				>
					<Row gutter={[16, 16]} align="middle" justify="space-between">
						<Col xs={24} md={14}>
							<Space orientation="vertical" size={4}>
								<Link to={`/clients/${clientId}`} style={{ fontSize: '13px' }}>
									<FaArrowLeft style={{ marginRight: '0.35rem' }} />
									Back to dashboard
								</Link>
								<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
									{goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
								</Typography.Title>
								<Typography.Text type="secondary">
									{clientName ? `For ${clientName}` : 'Goals attached to this client’s training cycles'}
								</Typography.Text>
							</Space>
						</Col>
						<Col xs={24} md={10} style={{ textAlign: 'right' }}>
							<Button type="primary" icon={<FaPlus />} size="large" onClick={handleNewGoal}>
								New Goal
							</Button>
						</Col>
					</Row>
				</div>

				{error && <Alert type="error" title={error} showIcon />}

				{loading ? (
					<div
						style={{
							backgroundColor: token.colorBgContainer,
							borderRadius: token.borderRadiusLG,
							border: `1px solid ${token.colorBorderSecondary}`,
							textAlign: 'center',
							padding: '3rem 0',
						}}
					>
						<Spin />
					</div>
				) : (
					<>
						{renderSection('Present', present, 'No goals tied to an active cycle yet.')}
						{renderSection('Past', past, 'No past goals yet.')}
					</>
				)}
			</div>

			<GoalModal
				open={modalOpen}
				clientId={clientId}
				existingGoal={editingGoal}
				onClose={() => setModalOpen(false)}
				onSaved={() => {
					refresh();
					navigate(`/clients/${clientId}/goals`, { replace: true });
				}}
			/>
		</PageLayout>
	);
}
