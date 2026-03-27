import type { PlannedExercise } from '@libre-train/shared';
import { Button, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { routineCategoryOptions } from '../../helpers/enum-select-options';
import { TimeInput } from '../Common/TimeInput';
import { ExercisePicker } from '../Exercises/ExercisePicker';

export interface RoutineExerciseCreateEditFormProps extends React.HTMLAttributes<HTMLDivElement> {
	initialValues?: RoutineExerciseCreateEditFormValues & {
		nodeDepth?: number;
	};
	onSubmitForm?: (values: RoutineExerciseCreateEditFormValues) => void;
}

export interface RoutineExerciseCreateEditFormValues extends Omit<PlannedExercise, 'exerciseName' | 'duration'> {
	category: number;
	rest_after?: number;
	duration?: string;
}

export function RoutineExerciseCreateEditForm(props: RoutineExerciseCreateEditFormProps) {
	const { initialValues: { nodeDepth, ...initialFormValues } = {}, onSubmitForm, ...divProps } = props;
	const [form] = Form.useForm();

	const isEdit = Object.keys(initialFormValues).length > 0;

	const onFinish = (values: RoutineExerciseCreateEditFormValues) => {
		onSubmitForm?.(values);
		form.resetFields();
	};

	useEffect(() => {
		form.resetFields();
	}, [props]);

	return (
		<div
			{...divProps}
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				...divProps.style,
			}}
		>
			<h3>{isEdit ? 'Edit Exercise' : 'Add Exercise'}</h3>
			<Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialFormValues}>
				<div
					style={{
						width: '100%',
						display: 'flex',
						gap: '2rem',
					}}
				>
					<Form.Item required label="Exercise" name="exercise_id" style={{ width: isEdit ? '50%' : '100%' }}>
						<ExercisePicker />
					</Form.Item>
					<Form.Item
						required
						label="Category"
						name="category"
						style={{ width: '100%', display: isEdit ? 'none' : 'block' }}
					>
						<Select options={routineCategoryOptions} placeholder="Select a category" />
					</Form.Item>
				</div>
				<div
					style={{
						display: 'grid',
						width: '100%',
						gridTemplateColumns: 'repeat(2, minmax(200px, 1fr))',
						columnGap: '2rem',
					}}
				>
					<Form.Item label="Reps" name="repetitions">
						<Input type="number" placeholder="e.g. 10" />
					</Form.Item>
					<Form.Item label="Sets" name="sets">
						<Input type="number" placeholder="e.g. 3" />
					</Form.Item>
					<Form.Item label="Weight" name="weight">
						<Input type="number" placeholder="e.g. 50" suffix="lbs" />
					</Form.Item>
					<Form.Item label="Duration" name="duration">
						<TimeInput placeholder="HH:MM:SS" />
					</Form.Item>
					<Form.Item label="Distance" name="distance">
						<Input type="number" placeholder="e.g. 100" suffix="Mi" />
					</Form.Item>
					<Form.Item label="Pace" name="pace">
						<Input placeholder="HH:MM:SS, 4-2-1-1" />
					</Form.Item>
					<Form.Item label="Target Heart Rate" name="target_heart_rate">
						<Input type="number" placeholder="e.g. 150" suffix="bpm" />
					</Form.Item>
					<Form.Item label="Target METs" name="target_mets">
						<Input type="number" placeholder="eg. 15.0" />
					</Form.Item>
					<Form.Item label="Target Calories" name="target_calories">
						<Input type="number" placeholder="e.g. 300" suffix="kcal" />
					</Form.Item>
					<Form.Item label="RPE" name="rpe">
						<Input type="number" placeholder="eg. 15" />
					</Form.Item>
					<Form.Item label="Rest After" name="rest_after" style={{ display: nodeDepth === 3 ? 'none' : undefined }}>
						<Input type="number" placeholder="e.g. 60" suffix="s" />
					</Form.Item>
				</div>
				<Form.Item>
					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '1rem',
						}}
					>
						<Button color="primary" variant="solid" htmlType="submit">
							{isEdit ? 'Save' : 'Add'}
						</Button>
						<Button type="default" onClick={() => form.resetFields()}>
							Reset
						</Button>
					</div>
				</Form.Item>
			</Form>
		</div>
	);
}
