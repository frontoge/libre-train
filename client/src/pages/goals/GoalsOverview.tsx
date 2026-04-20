import type { ClientGoalWithRelations, GoalStatus } from '@libre-train/shared';
import { GoalStatusValues } from '@libre-train/shared';
import { Alert, Button, Col, Empty, Result, Row, Segmented, Select, Space, Spin, theme, Typography } from 'antd';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { AppContext } from '../../app-context';
import { GoalCard } from '../../components/Goals/GoalCard';
import { GoalModal } from '../../components/Goals/GoalModal';
import PageLayout from '../../components/PageLayout';
import { deleteClientGoal, fetchTrainerGoals } from '../../helpers/goals-api';
import { useMessage } from '../../hooks/useMessage';

type SectionFilter = 'all' | 'present' | 'past';

const isActiveGoal = (goal: ClientGoalWithRelations): boolean => goal.status === 'planned' || goal.status === 'in_progress';

const statusLabel = (status: GoalStatus) => status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function GoalsOverview() {
	const { state } = useContext(AppContext);
	const { token } = theme.useToken();
	const trainerId = state.auth.user;
	const showMessage = useMessage();

	const [goals, setGoals] = useState<ClientGoalWithRelations[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [section, setSection] = useState<SectionFilter>('present');
	const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>('all');
	const [modalOpen, setModalOpen] = useState(false);
	const [editingGoal, setEditingGoal] = useState<ClientGoalWithRelations | undefined>();

	const load = useCallback(async () => {
		if (trainerId === undefined) return;
		setLoading(true);
		setError(undefined);
		try {
			const goalsResult = await fetchTrainerGoals(trainerId);
			setGoals(goalsResult);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load goals');
		} finally {
			setLoading(false);
		}
	}, [trainerId]);

	useEffect(() => {
		load();
	}, [load]);

	const filteredGoals = useMemo(() => {
		let list = goals;
		if (section === 'present') list = list.filter(isActiveGoal);
		else if (section === 'past') list = list.filter((goal) => !isActiveGoal(goal));
		if (statusFilter !== 'all') list = list.filter((goal) => goal.status === statusFilter);
		return list;
	}, [goals, section, statusFilter]);

	const presentCount = useMemo(() => goals.filter(isActiveGoal).length, [goals]);
	const pastCount = goals.length - presentCount;

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
			load();
		} catch (err) {
			showMessage('error', err instanceof Error ? err.message : 'Failed to delete goal');
		}
	};

	if (trainerId === undefined) {
		return (
			<PageLayout title="Goals">
				<Result status="403" title="Not signed in" />
			</PageLayout>
		);
	}

	return (
		<PageLayout title="Goals">
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
								<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
									{goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
								</Typography.Title>
								<Typography.Text type="secondary">
									{presentCount} active · {pastCount} past · across all of your clients
								</Typography.Text>
							</Space>
						</Col>
						<Col xs={24} md={10} style={{ textAlign: 'right' }}>
							<Button
								type="primary"
								icon={<FaPlus />}
								size="large"
								onClick={handleNewGoal}
								disabled={state.clients.length === 0}
							>
								New Goal
							</Button>
						</Col>
					</Row>
				</div>

				<div
					style={{
						backgroundColor: token.colorBgContainer,
						padding: 'clamp(1rem, 3vw, 1.5rem)',
						borderRadius: token.borderRadiusLG,
						border: `1px solid ${token.colorBorderSecondary}`,
					}}
				>
					<Row gutter={[16, 16]} align="middle" justify="space-between">
						<Col xs={24} md="auto">
							<Segmented
								options={[
									{ label: `Present (${presentCount})`, value: 'present' },
									{ label: `Past (${pastCount})`, value: 'past' },
									{ label: `All (${goals.length})`, value: 'all' },
								]}
								value={section}
								onChange={(value) => setSection(value as SectionFilter)}
								block
							/>
						</Col>
						<Col xs={24} md="auto">
							<Select
								style={{ minWidth: 180, width: '100%' }}
								value={statusFilter}
								onChange={(value) => setStatusFilter(value)}
								options={[
									{ value: 'all', label: 'Any status' },
									...GoalStatusValues.map((status) => ({ value: status, label: statusLabel(status) })),
								]}
							/>
						</Col>
					</Row>
				</div>

				{error && <Alert type="error" title={error} showIcon />}

				<div
					style={{
						backgroundColor: token.colorBgContainer,
						padding: 'clamp(1rem, 3vw, 1.5rem)',
						borderRadius: token.borderRadiusLG,
						border: `1px solid ${token.colorBorderSecondary}`,
					}}
				>
					{loading ? (
						<div style={{ textAlign: 'center', padding: '3rem 0' }}>
							<Spin />
						</div>
					) : filteredGoals.length === 0 ? (
						<Empty description="No goals match these filters." />
					) : (
						<>
							<Typography.Paragraph type="secondary" style={{ marginBottom: '1rem' }}>
								Showing {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
							</Typography.Paragraph>
							<Row gutter={[16, 16]}>
								{filteredGoals.map((goal) => (
									<Col key={goal.id} xs={24} sm={12} lg={8} xl={6}>
										<GoalCard goal={goal} showClient onEdit={handleEdit} onDelete={handleDelete} />
									</Col>
								))}
							</Row>
						</>
					)}
				</div>
			</div>

			<GoalModal
				open={modalOpen}
				clientId={editingGoal ? (editingGoal.Client?.id ?? editingGoal.client_id) : undefined}
				existingGoal={editingGoal}
				onClose={() => setModalOpen(false)}
				onSaved={load}
			/>
		</PageLayout>
	);
}
