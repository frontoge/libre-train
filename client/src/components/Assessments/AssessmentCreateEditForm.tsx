import { AssessmentGroup } from '@libre-train/shared';
import { useContext, useState, type JSX } from 'react';
import { AppContext } from '../../app-context';
import { createAssessmentLog, updateAssessmentLog } from '../../api/assessment';
import { useMessage } from '../../hooks/useMessage';
import type { AssessmentFormValues } from '../../types/types';
import { ClientSearch } from '../clients/ClientSearch';
import { AssessmentTypeSelect } from './AssessmentTypeSelect';
import { CompositionAssessmentForm } from './CompositionAssessmentForm';

export type AssessmentCreateEditInitialValues = {
	assessment?: AssessmentFormValues;
	logId?: number;
	client?: {
		key?: string;
		label: React.ReactNode;
		value: string;
	};
	assessmentTypeId?: number;
};

export type AssessmentCreateEditFormProps = {
	isEdit?: boolean;
	onSubmit?: (values: AssessmentFormValues) => void;
	onCancel?: () => void;
	initialValues?: AssessmentCreateEditInitialValues;
};

export function AssessmentCreateEditForm(props: AssessmentCreateEditFormProps) {
	const {
		state: { assessmentTypes },
	} = useContext(AppContext);
	const showMessage = useMessage();

	if (!assessmentTypes) {
		return <div>Loading...</div>;
	}

	const [selectedClient, setSelectedClient] = useState<number | null>(
		props.initialValues?.client?.value ? Number(props.initialValues.client.value) : null
	);
	const [assessmentType, setAssessmentType] = useState<number | null>(props.initialValues?.assessmentTypeId || null);

	const selectedAssessmentType = assessmentTypes.find((type) => type.id === assessmentType);

	const resetFields = () => {
		setSelectedClient(null);
		setAssessmentType(null);
	};

	const createNewAssessmentRequest = async (result: AssessmentFormValues) => {
		try {
			await createAssessmentLog({
				clientId: selectedClient!,
				assessments: [
					{
						assessmentTypeId: assessmentType!,
						assessmentDate: result.date?.format('YYYY-MM-DD'),
						assessmentValue: result.result,
						notes: result.notes,
					},
				],
			});
			showMessage('success', 'Assessment log created successfully');
			resetFields();
		} catch {
			showMessage('error', 'Failed to create assessment log');
			console.error('Failed to create assessment log');
		}
	};

	const updateAssessmentRequest = async (result: AssessmentFormValues) => {
		if (!props.initialValues?.logId) {
			console.error('No log ID provided for update');
			return;
		}
		try {
			await updateAssessmentLog(props.initialValues.logId, {
				clientId: selectedClient ?? undefined,
				assessmentTypeId: assessmentType ?? undefined,
				assessmentDate: result.date?.format('YYYY-MM-DD'),
				assessmentValue: result.result,
				notes: result.notes,
			});
			showMessage('success', 'Assessment log updated successfully');
		} catch {
			showMessage('error', 'Failed to update assessment log');
			console.error('Failed to update assessment log');
		}
	};

	const handleSubmit = (result: AssessmentFormValues) => {
		if (props.isEdit) {
			updateAssessmentRequest(result);
			props.onSubmit?.(result);
		} else {
			createNewAssessmentRequest(result);
			props.onSubmit?.(result);
		}
	};

	const assessmentForms: { [key in AssessmentGroup]?: JSX.Element } = {
		[AssessmentGroup.Composition]: (
			<CompositionAssessmentForm
				assessmentTypeId={assessmentType!}
				onSubmit={handleSubmit}
				initialValues={props.initialValues?.assessment}
			/>
		),
	};

	return (
		<>
			<div
				style={{
					display: 'flex',
					width: '100%',
					gap: '2rem',
					justifyContent: 'start',
				}}
			>
				<ClientSearch
					style={{ width: '40%', marginBottom: '2rem' }}
					onClientSelect={(clientId) => setSelectedClient(clientId ? Number(clientId) : null)}
					defaultValue={props.initialValues?.client?.value ?? undefined}
				/>
				<AssessmentTypeSelect
					style={{ width: '40%', marginBottom: '2rem' }}
					onAssessmentTypeSelect={(typeId) => setAssessmentType(Number(typeId))}
					value={assessmentType}
				/>
			</div>
			{selectedClient
				&& selectedAssessmentType
				&& assessmentForms[selectedAssessmentType?.assessmentGroupId as AssessmentGroup]}
		</>
	);
}
