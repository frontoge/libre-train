import type { ClientGoalWithRelations, GoalStatus } from '@libre-train/shared';
import { Card, Popconfirm, Tag, theme, Typography } from 'antd';
import { FaTrash } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import { Link } from 'react-router-dom';
import dayjs from '../../config/dayjs';

type StatusVisual = { tag: string; accent: string };

const statusVisuals: Record<GoalStatus, StatusVisual> = {
	planned: { tag: 'purple', accent: '#722ed1' },
	in_progress: { tag: 'blue', accent: '#1677ff' },
	achieved: { tag: 'green', accent: '#49aa19' },
	missed: { tag: 'volcano', accent: '#d4380d' },
	abandoned: { tag: 'default', accent: '#595959' },
};

const statusLabel = (status: GoalStatus): string => status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const resolveCycle = (goal: ClientGoalWithRelations) => {
	if (goal.Macrocycle) return { level: 'Macrocycle', data: goal.Macrocycle };
	if (goal.Mesocycle) return { level: 'Mesocycle', data: goal.Mesocycle };
	if (goal.Microcycle) return { level: 'Microcycle', data: goal.Microcycle };
	return undefined;
};

export interface GoalCardProps {
	goal: ClientGoalWithRelations;
	showClient?: boolean;
	onEdit?: (goal: ClientGoalWithRelations) => void;
	onDelete?: (goal: ClientGoalWithRelations) => void;
}

export function GoalCard({ goal, showClient, onEdit, onDelete }: GoalCardProps) {
	const { token } = theme.useToken();
	const cycle = resolveCycle(goal);
	const visual = statusVisuals[goal.status];

	const actions = [
		onEdit ? (
			<div key="edit" style={{ width: '100%' }} onClick={() => onEdit(goal)}>
				<MdEdit />
			</div>
		) : null,
		onDelete ? (
			<Popconfirm key="delete" title="Delete this goal? This cannot be undone." onConfirm={() => onDelete(goal)}>
				<div style={{ width: '100%' }}>
					<FaTrash />
				</div>
			</Popconfirm>
		) : null,
	].filter(Boolean) as React.ReactNode[];

	const titleText = goal.target_date ? `Due ${dayjs(goal.target_date).format('MMM D, YYYY')}` : 'No target date';

	const title = (
		<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
			<Typography.Text strong style={{ maxWidth: '100%' }}>
				{titleText}
			</Typography.Text>
			<Tag color={visual.tag} style={{ margin: 0 }}>
				{statusLabel(goal.status)}
			</Tag>
		</div>
	);

	return (
		<Card
			size="small"
			title={title}
			actions={actions.length ? actions : undefined}
			style={{
				height: '100%',
				borderTop: `3px solid ${visual.accent}`,
			}}
			styles={{ body: { display: 'flex', flexDirection: 'column', gap: '0.5rem' } }}
		>
			{showClient && goal.Client && (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
					<Typography.Text type="secondary" style={{ fontSize: '13px' }}>
						Client
					</Typography.Text>
					<Link to={`/clients/${goal.Client.id}/goals`} style={{ fontSize: '13px' }}>
						{goal.Client.first_name} {goal.Client.last_name}
					</Link>
				</div>
			)}
			{cycle && (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
					<Typography.Text type="secondary" style={{ fontSize: '13px' }}>
						{cycle.level}
					</Typography.Text>
					<Typography.Text style={{ fontSize: '13px', textAlign: 'right', color: token.colorTextHeading }}>
						{cycle.data.cycle_name ?? `${cycle.data.cycle_start_date} – ${cycle.data.cycle_end_date}`}
					</Typography.Text>
				</div>
			)}

			{goal.description && (
				<Typography.Paragraph style={{ margin: 0, color: token.colorText }}>{goal.description}</Typography.Paragraph>
			)}

			{goal.assessments.length > 0 && (
				<div
					style={{
						borderTop: `1px solid ${token.colorBorderSecondary}`,
						paddingTop: '0.5rem',
						marginTop: '0.25rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '2px',
					}}
				>
					{goal.assessments.map((assessment) => (
						<div
							key={assessment.id}
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'baseline',
								gap: '0.5rem',
								fontSize: '13px',
								padding: '2px 0',
							}}
						>
							<Typography.Text type="secondary" style={{ fontSize: '13px' }}>
								{assessment.AssessmentType.name}
							</Typography.Text>
							<Typography.Text style={{ fontSize: '13px', color: token.colorTextHeading }}>
								{assessment.target_value}
								{assessment.AssessmentType.assessmentUnit ? ` ${assessment.AssessmentType.assessmentUnit}` : ''}
							</Typography.Text>
						</div>
					))}
				</div>
			)}
		</Card>
	);
}
