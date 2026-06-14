import { Button, Col, DatePicker, Form, Input, Row } from 'antd';
import { FaEnvelope, FaPhone, FaRegUser } from 'react-icons/fa';
import type { ContactEditCreateFormValues } from '../../types/types';

export interface ContactEditCreateFormProps {
	onSubmit: (values: ContactEditCreateFormValues) => boolean | undefined;
	onCancel?: () => void;
	initialValues?: ContactEditCreateFormValues;
	onError?: (error: any) => void;
}

export function ContactEditCreateForm(props: ContactEditCreateFormProps) {
	const [form] = Form.useForm();
	const isEdit = !!props.initialValues;

	const onFinish = (values: ContactEditCreateFormValues) => {
		try {
			const result = props.onSubmit(values);
			if (result === undefined || result === true) {
				form.resetFields();
			}
		} catch (error) {
			props.onError?.(error);
		}
	};

	return (
		<Form
			form={form}
			layout="vertical"
			variant="filled"
			requiredMark="optional"
			onFinish={onFinish}
			name="contact-edit-create-form"
			initialValues={props.initialValues}
			style={{ marginTop: '0.5rem' }}
		>
			<Row gutter={16}>
				<Col xs={24} sm={12}>
					<Form.Item
						label="First name"
						name="firstName"
						rules={[{ required: true, message: 'First name is required.' }]}
					>
						<Input prefix={<FaRegUser />} placeholder="Jane" />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item label="Last name" name="lastName" rules={[{ required: true, message: 'Last name is required.' }]}>
						<Input prefix={<FaRegUser />} placeholder="Doe" />
					</Form.Item>
				</Col>
			</Row>

			<Form.Item
				label="Email"
				name="email"
				rules={[
					{ required: true, message: 'Email is required.' },
					{ type: 'email', message: 'Enter a valid email address.' },
				]}
			>
				<Input prefix={<FaEnvelope />} placeholder="jane.doe@example.com" />
			</Form.Item>

			<Row gutter={16}>
				<Col xs={24} sm={12}>
					<Form.Item label="Phone number" name="phoneNumber">
						<Input prefix={<FaPhone />} placeholder="(555) 123-4567" />
					</Form.Item>
				</Col>
				<Col xs={24} sm={12}>
					<Form.Item label="Date of birth" name="dob">
						<DatePicker style={{ width: '100%' }} format="MMM D, YYYY" placeholder="Select a date" />
					</Form.Item>
				</Col>
			</Row>

			<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
				{props.onCancel && (
					<Button htmlType="button" onClick={props.onCancel}>
						Cancel
					</Button>
				)}
				<Button type="primary" htmlType="submit">
					{isEdit ? 'Save changes' : 'Add contact'}
				</Button>
			</div>
		</Form>
	);
}
