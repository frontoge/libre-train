import { TrainingCycleType } from '@libre-train/shared';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { CreateEditTrainingPlan, type CreateEditTrainingPlanFormValues } from '../../components/Training/CreateEditTrainingPlan';
import { cycleCreateHelpers } from '../../helpers/training-helpers';
import { useMessage } from '../../hooks/useMessage';

export function NewPlan() {
	const navigate = useNavigate();
	const showMessage = useMessage();
	const handleSubmit = async (values: CreateEditTrainingPlanFormValues) => {
		const result = await cycleCreateHelpers[values.cycleType](values);
		if (result) {
			showMessage('success', 'Training plan created successfully!');
			// Navigate to training plan viewer for the newly created plan
			if (values.cycleType === TrainingCycleType.Microcycle) {
				const microcycleId = result;
				// Redirect to cycle routine builder
				navigate(`/training/cycle/${microcycleId}/builder/`);
			}
		} else {
			showMessage('error', 'Failed to create training plan.');
		}
	};

	return (
		<PageLayout
			title="New Training Plan"
			style={{
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
