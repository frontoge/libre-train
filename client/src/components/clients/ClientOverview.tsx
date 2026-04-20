import { AntDesignOutlined } from '@ant-design/icons';
import type { AssessmentClientLog, ClientGoalAssessmentWithType, ClientGoalWithRelations } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { Avatar, Progress, theme, Tooltip, Typography } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ClientContact } from '../../../../shared/models';
import { getAppConfiguration } from '../../config/app.config';
import dayjs from '../../config/dayjs';
import { ClientDashboardContext } from '../../contexts/ClientDashboardContext';
import { createSearchParams } from '../../helpers/fetch-helpers';
import { fetchClientGoals } from '../../helpers/goals-api';
import { Panel } from '../Panel';

const ACTIVE_STATUSES: ClientGoalWithRelations['status'][] = ['planned', 'in_progress'];

const pickNextGoal = (goals: ClientGoalWithRelations[]): ClientGoalWithRelations | undefined => {
	const candidates = goals.filter((goal) => ACTIVE_STATUSES.includes(goal.status) && goal.assessments.length > 0);
	const withDate = candidates.filter((goal) => !!goal.target_date);
	const pool = withDate.length > 0 ? withDate : candidates;
	return [...pool].sort((a, b) => {
		const aDate = a.target_date ? new Date(a.target_date).getTime() : Number.POSITIVE_INFINITY;
		const bDate = b.target_date ? new Date(b.target_date).getTime() : Number.POSITIVE_INFINITY;
		return aDate - bDate;
	})[0];
};

async function fetchLatestAssessmentLog(
	clientId: number,
	assessmentTypeId: number,
	end?: string
): Promise<AssessmentClientLog | undefined> {
	const params = createSearchParams({ type: assessmentTypeId, pageSize: 1, page: 1, end });
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}/${clientId}?${params}`);
	if (!response.ok) return undefined;
	const data = await response.json();
	if (Array.isArray(data) && data.length > 0) return data[0] as AssessmentClientLog;
	return undefined;
}

type ProgressResult = {
	percent: number;
	currentValue: number;
	targetValue: number;
	baselineValue: number;
	assessment: ClientGoalAssessmentWithType;
};

const computePercent = (baseline: number, current: number, target: number): number => {
	if (target === baseline) return current === target ? 100 : 0;
	const raw = target > baseline ? (current - baseline) / (target - baseline) : (baseline - current) / (baseline - target);
	return Math.max(0, Math.min(100, Math.round(raw * 100)));
};

export function ClientOverview({ selectedClient }: { selectedClient: ClientContact | undefined }) {
	const { dashboardState } = useContext(ClientDashboardContext);
	const { token } = theme.useToken();

	const loggedWeight = dashboardState.data.logged_weight ?? 0;
	const [goals, setGoals] = useState<ClientGoalWithRelations[]>([]);
	const [progress, setProgress] = useState<ProgressResult | undefined>(undefined);

	useEffect(() => {
		if (!selectedClient) {
			setGoals([]);
			return;
		}
		let cancelled = false;
		fetchClientGoals(selectedClient.ClientId)
			.then((result) => {
				if (!cancelled) setGoals(result);
			})
			.catch((error) => {
				console.error('Error loading goals for overview:', error);
				if (!cancelled) setGoals([]);
			});
		return () => {
			cancelled = true;
		};
	}, [selectedClient]);

	const nextGoal = useMemo(() => pickNextGoal(goals), [goals]);
	const targetDate = nextGoal?.target_date ? dayjs(nextGoal.target_date).format('MMM D, YYYY') : undefined;

	useEffect(() => {
		setProgress(undefined);
		if (!selectedClient || !nextGoal || nextGoal.assessments.length === 0) return;
		const assessment = nextGoal.assessments[0];
		const targetValue = Number.parseFloat(assessment.target_value);
		if (!Number.isFinite(targetValue)) return;

		let cancelled = false;
		(async () => {
			const [currentLog, baselineLog] = await Promise.all([
				fetchLatestAssessmentLog(selectedClient.ClientId, assessment.assessment_type_id),
				fetchLatestAssessmentLog(selectedClient.ClientId, assessment.assessment_type_id, nextGoal.created_at),
			]);

			if (cancelled) return;

			const currentValue = currentLog ? Number.parseFloat(currentLog.assessmentValue) : NaN;
			// Baseline: latest log on/before goal creation. If none exists yet, fall back to the current value
			// so the ring starts at 0% rather than NaN.
			const baselineValue = baselineLog ? Number.parseFloat(baselineLog.assessmentValue) : currentValue;
			if (!Number.isFinite(currentValue) || !Number.isFinite(baselineValue)) return;

			setProgress({
				percent: computePercent(baselineValue, currentValue, targetValue),
				currentValue,
				targetValue,
				baselineValue,
				assessment,
			});
		})().catch((error) => {
			console.error('Error computing goal progress:', error);
		});

		return () => {
			cancelled = true;
		};
	}, [selectedClient, nextGoal]);

	const unit = progress?.assessment.AssessmentType.assessmentUnit ?? '';
	const centerText = progress
		? `${progress.currentValue}${unit ? ` ${unit}` : ''}`
		: selectedClient
			? `${loggedWeight}lbs`
			: '';
	const centerSubText = progress ? `/ ${progress.targetValue}${unit ? ` ${unit}` : ''}` : undefined;

	const tooltipText = progress
		? `${progress.assessment.AssessmentType.name}: ${progress.baselineValue} → ${progress.currentValue} / ${progress.targetValue}${unit ? ` ${unit}` : ''}${nextGoal?.description ? ` — ${nextGoal.description}` : ''}`
		: nextGoal
			? (nextGoal.description ?? 'Next goal (no numeric metric)')
			: 'No upcoming goal';

	return (
		<Panel
			id="client-dash-information"
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'start',
				height: '20%',
				gap: '2rem',
				padding: '1rem',
			}}
		>
			{selectedClient === undefined ? (
				<h1 style={{ marginLeft: '2rem' }}>Select A client</h1>
			) : (
				<>
					<Avatar
						size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
						icon={dashboardState.data.img ?? <AntDesignOutlined />}
					/>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'start',
							alignSelf: 'start',
							gap: '0.1rem',
							flexGrow: 1,
						}}
					>
						<div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
							<h2 style={{ margin: 0 }}>{`${selectedClient?.first_name} ${selectedClient?.last_name}`}</h2>
							<Link to={`/clients/${selectedClient.ClientId}/goals`}>Goals</Link>
						</div>
						<div>Email: {selectedClient?.email ?? ''}</div>
						<div>Phone: {selectedClient?.phone ?? ''}</div>
						<div>{`Height: ${selectedClient?.height ?? 'N/A'}`}</div>
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							gap: '0.4rem',
						}}
					>
						<div>
							<span>Body Fat:</span>
							<span>{'Coming Soon'}</span>
						</div>
						<div>
							<span>Lean Mass:</span>
							<span>{'Coming Soon'}</span>
						</div>
						<div>
							<span>Phase:</span>
							<span>{'Coming Soon'}</span>
						</div>
					</div>
					<div
						id="client-progress"
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							width: '15%',
							height: '100%',
							gap: '0.25rem',
						}}
					>
						<Tooltip title={tooltipText}>
							<Progress
								type="dashboard"
								percent={progress?.percent ?? 0}
								gapDegree={90}
								format={() => (
									<div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
										<span style={{ fontSize: '1rem', fontWeight: 500 }}>{centerText}</span>
										{centerSubText && (
											<span style={{ fontSize: '0.7rem', color: token.colorTextSecondary }}>
												{centerSubText}
											</span>
										)}
									</div>
								)}
								style={{ height: '80%' }}
							/>
						</Tooltip>
						{targetDate && (
							<Typography.Text type="secondary" style={{ fontSize: '0.75rem' }}>
								by {targetDate}
							</Typography.Text>
						)}
					</div>
				</>
			)}
		</Panel>
	);
}
