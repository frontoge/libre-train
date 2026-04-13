import { Routes, type MuscleGroup } from '@libre-train/shared';
import { Button, Form, Input, Rate, Select } from 'antd';
import { useContext } from 'react';
import { AppContext } from '../../app-context';
import { getAppConfiguration } from '../../config/app.config';
import { exerciseFormOptions, exerciseMovementPatternOptions } from '../../helpers/enum-select-options';
import { useMessage } from '../../hooks/useMessage';
import { MuscleGroupSearch } from './MuscleGroupSearch';

export interface CreateEditExerciseFormProps extends React.ComponentProps<typeof Form<CreateEditExerciseFormValues>> {
	initialExerciseId?: number;
	onComplete?: () => void;
}

export interface CreateEditExerciseFormValues {
	exerciseName: string;
	movementPattern?: number;
	exerciseType: number;
	muscleGroups?: MuscleGroup[];
	progressionLevel: number;
	videoLink?: string;
	description?: string;
	equipmentNeeded?: string;
}

export function CreateEditExerciseForm(props: CreateEditExerciseFormProps) {
	const [form] = Form.useForm<CreateEditExerciseFormValues>();
	const showMessage = useMessage();
	const {
		state: { exerciseData },
		stateRefreshers,
	} = useContext(AppContext);

	const exerciseToEdit = props.initialExerciseId ? exerciseData?.find((e) => e.id === props.initialExerciseId) : null;

	const initialValues = exerciseToEdit
		? {
				exerciseName: exerciseToEdit.exercise_name,
				movementPattern: exerciseToEdit.movement_pattern,
				exerciseType: exerciseToEdit.exercise_form,
				muscleGroups: exerciseToEdit.muscle_groups.filter((mg) => mg !== null),
				progressionLevel: exerciseToEdit.progression_level,
				videoLink: exerciseToEdit.video_link,
				description: exerciseToEdit.exercise_description,
				equipmentNeeded: exerciseToEdit.equipment,
			}
		: {};

	const createNewExercise = async (values: CreateEditExerciseFormValues) => {
		try {
			const requestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					exercise_name: values.exerciseName,
					muscle_groups: values.muscleGroups,
					exercise_description: values.description,
					video_link: values.videoLink,
					equipment: values.equipmentNeeded,
					exercise_form: values.exerciseType,
					movement_pattern: values.movementPattern,
					progression_level: values.progressionLevel,
				}),
			};

			const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}`, requestOptions);
			if (!response.ok) {
				throw new Error(`Error creating exercise: ${response.statusText}`);
			}

			stateRefreshers?.refreshExerciseData();
			showMessage('success', 'Exercise created successfully');
			props.onComplete?.();
		} catch (error) {
			console.error('Error creating exercise:', error);
			showMessage('error', 'Failed to create exercise. Please try again.');
		}
	};

	const updateExistingExercise = async (values: CreateEditExerciseFormValues) => {
		try {
			const requestOptions = {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					exercise_name: values.exerciseName,
					muscle_groups: values.muscleGroups ?? [],
					exercise_description: values.description ?? '',
					video_link: values.videoLink ?? '',
					equipment: values.equipmentNeeded ?? '',
					exercise_form: values.exerciseType,
					movement_pattern: values.movementPattern,
					progression_level: values.progressionLevel,
				}),
			};

			const response = await fetch(
				`${getAppConfiguration().apiUrl}${Routes.Exercise}/${props.initialExerciseId}`,
				requestOptions
			);
			if (!response.ok) {
				throw new Error(`Error updating exercise: ${response.statusText}`);
			}
			stateRefreshers?.refreshExerciseData();
			showMessage('success', 'Exercise updated successfully');
			props.onComplete?.();
		} catch (error) {
			console.error('Error updating exercise:', error);
			showMessage('error', 'Failed to update exercise. Please try again.');
		}
	};

	const handleSubmit = (values: CreateEditExerciseFormValues) => {
		if (props.initialExerciseId) {
			updateExistingExercise(values);
		} else {
			createNewExercise(values);
		}
	};

	return (
		<Form<CreateEditExerciseFormValues>
			labelCol={{ span: 7 }}
			form={form}
			layout="horizontal"
			initialValues={initialValues}
			onFinish={handleSubmit}
			{...props}
		>
			<h3>{props.initialExerciseId ? 'Edit Exercise' : 'Create Exercise'}</h3>
			<Form.Item required label="Name" name="exerciseName">
				<Input placeholder="Exercise name" />
			</Form.Item>
			<Form.Item required label="Muscle Groups" name="muscleGroups">
				<MuscleGroupSearch />
			</Form.Item>
			<Form.Item label="Movement Pattern" name="movementPattern">
				<Select placeholder="Movement pattern" allowClear options={exerciseMovementPatternOptions} />
			</Form.Item>
			<Form.Item required label="Exercise Type" name="exerciseType">
				<Select placeholder="Exercise type" allowClear options={exerciseFormOptions} />
			</Form.Item>
			<Form.Item required label="Progression Level" name="progressionLevel">
				<Rate character={({ index = 0 }) => index + 1} allowClear />
			</Form.Item>
			<Form.Item
				label="Video Link"
				name="videoLink"
				rules={[{ max: 512, message: 'Video link must be at most 512 characters' }]}
			>
				<Input placeholder="Video link" />
			</Form.Item>
			<Form.Item label="Description" name="description">
				<Input.TextArea
					placeholder="Exercise description"
					autoSize={{ minRows: 3, maxRows: 6 }}
					maxLength={512}
					showCount
				/>
			</Form.Item>
			<Form.Item label="Equipment Needed" name="equipmentNeeded">
				<Input.TextArea placeholder="Equipment needed" autoSize={{ minRows: 2, maxRows: 4 }} maxLength={512} showCount />
			</Form.Item>
			<Form.Item>
				<div
					style={{
						display: 'flex',
						justifyContent: 'flex-end',
					}}
				>
					<Button type="primary" htmlType="submit">
						Save
					</Button>
					<Button style={{ marginLeft: '8px' }} onClick={() => form.resetFields()}>
						Reset
					</Button>
				</div>
			</Form.Item>
		</Form>
	);
}
