import type { PlannedExerciseGroup } from '@libre-train/shared';
import { Button, Form, Input } from 'antd';
import { useEffect } from 'react';

export interface RoutineGroupEditFormProps extends React.HTMLAttributes<HTMLDivElement> {
	initialValues?: RoutineGroupEditFormValues;
	onSubmitForm?: (values: RoutineGroupEditFormValues) => void;
}

export interface RoutineGroupEditFormValues extends Omit<PlannedExerciseGroup, 'exercises' | 'routine_category'> {
	rest_after?: number;
	rest_between?: number;
}

export function RoutineGroupEditForm(props: RoutineGroupEditFormProps) {
	const { initialValues, onSubmitForm, ...divProps } = props;
	const [form] = Form.useForm();

	const onFinish = (values: RoutineGroupEditFormValues) => {
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
			<h3>Edit Group</h3>
			<Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
				<div
					style={{
						display: 'flex',
						gap: '1rem',
					}}
				>
					<Form.Item label="Rest Between Exercises" name="rest_between" style={{ width: '50%' }}>
						<Input type="number" placeholder="0" suffix="s" />
					</Form.Item>
					<Form.Item label="Rest After Cycle" name="rest_after" style={{ width: '50%' }}>
						<Input type="number" placeholder="0" suffix="s" />
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
							Save
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
