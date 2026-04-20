import type { CreateClientGoalRequest, GoalAssessmentInput } from '@libre-train/shared';
import { CycleLevel, TrainingCycleType } from '@libre-train/shared';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { CreateEditTrainingPlan, type CreateEditTrainingPlanFormValues } from '../../components/Training/CreateEditTrainingPlan';
import { createClientGoal } from '../../helpers/goals-api';
import { cycleCreateHelpers } from '../../helpers/training-helpers';
import { useMessage } from '../../hooks/useMessage';

const cycleLevelByType: Record<TrainingCycleType, CycleLevel> = {
	[TrainingCycleType.Macrocycle]: CycleLevel.Macrocycle,
	[TrainingCycleType.Mesocycle]: CycleLevel.Mesocycle,
	[TrainingCycleType.Microcycle]: CycleLevel.Microcycle,
};

export function NewPlan() {
	const navigate = useNavigate();
	const showMessage = useMessage();

	const buildGoalRequest = (values: CreateEditTrainingPlanFormValues, cycleId: number): CreateClientGoalRequest | undefined => {
		if (!values.addGoal) return undefined;
		const assessments: GoalAssessmentInput[] = (values.goalAssessments ?? [])
			.filter(
				(row): row is { assessmentTypeId: number; targetValue: string } =>
					row?.assessmentTypeId !== undefined && !!row.targetValue?.trim()
			)
			.map((row) => ({ assessment_type_id: row.assessmentTypeId, target_value: row.targetValue.trim() }));
		if (assessments.length === 0) return undefined;

		const level = cycleLevelByType[values.cycleType];
		return {
			client_id: Number(values.selectedClient),
			macrocycle_id: level === CycleLevel.Macrocycle ? cycleId : undefined,
			mesocycle_id: level === CycleLevel.Mesocycle ? cycleId : undefined,
			microcycle_id: level === CycleLevel.Microcycle ? cycleId : undefined,
			description: values.goalDescription,
			target_date: values.goalTargetDate ? values.goalTargetDate.format('YYYY-MM-DD') : undefined,
			assessments,
		};
	};

	const handleSubmit = async (values: CreateEditTrainingPlanFormValues) => {
		const cycleId = await cycleCreateHelpers[values.cycleType](values);
		if (!cycleId) {
			showMessage('error', 'Failed to create training plan.');
			return;
		}
		showMessage('success', 'Training plan created successfully!');

		const goalBody = buildGoalRequest(values, cycleId);
		if (goalBody) {
			try {
				await createClientGoal(goalBody);
				showMessage('success', 'Goal attached to cycle.');
			} catch (error) {
				console.error('Error creating goal with cycle:', error);
				showMessage('error', error instanceof Error ? error.message : 'Failed to create goal.');
			}
		} else if (values.addGoal) {
			showMessage('warning', 'Goal section was enabled but no metrics were added — skipping.');
		}

		if (values.cycleType === TrainingCycleType.Microcycle) {
			navigate(`/training/cycle/${cycleId}/builder/`);
		}
	};

	return (
		<PageLayout
			title="New Training Plan"
			contentStyle={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: '2rem',
			}}
		>
			<Panel
				style={{
					height: '100%',
					width: '50%',
					display: 'flex',
					justifyContent: 'center',
					paddingTop: '2rem',
				}}
			>
				<CreateEditTrainingPlan onSubmit={handleSubmit} />
			</Panel>
		</PageLayout>
	);
}
