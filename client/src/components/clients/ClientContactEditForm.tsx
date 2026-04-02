import { PlusOutlined } from '@ant-design/icons';
import type { ClientContact } from '@libre-train/shared';
import { Button, DatePicker, Form, Input, InputNumber, Space, Spin, Upload } from 'antd';
import type { UploadFile } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import type { ClientContactEditFormValues } from '../../types/types';

const readFileAsDataUrl = async (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error('Unable to read image file'));
	});

export interface ClientContactEditFormProps {
	/** Initial contact data to populate the form */
	initialValues?: Partial<ClientContact>;
	/** Callback when form is submitted with validated values */
	onSubmit?: (values: ClientContactEditFormValues) => void | Promise<void>;
	/** Callback when form submission encounters an error */
	onError?: (error: Error) => void;
	/** Callback when form is cancelled */
	onCancel?: () => void;
	/** Show cancel button */
	showCancel?: boolean;
	/** Loading state */
	loading?: boolean;
	/** Form layout - 'vertical' for modals, 'horizontal' for pages */
	layout?: 'vertical' | 'horizontal';
	/** Submit button text override */
	submitButtonText?: string;
	/** Show reset button */
	showReset?: boolean;
}

export function ClientContactEditForm({
	initialValues,
	onSubmit,
	onError,
	onCancel,
	showCancel = true,
	loading = false,
	layout = 'vertical',
	submitButtonText = 'Save Contact',
	showReset = true,
}: ClientContactEditFormProps) {
	const [form] = Form.useForm<ClientContactEditFormValues>();
	const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

	const mappedInitialValues = useMemo<ClientContactEditFormValues | undefined>(() => {
		if (!initialValues) {
			return undefined;
		}

		return {
			firstName: initialValues.first_name,
			lastName: initialValues.last_name,
			email: initialValues.email,
			phoneNumber: initialValues.phone,
			dob: initialValues.date_of_birth ? dayjs(initialValues.date_of_birth) : undefined,
			img: initialValues.img,
			height: initialValues.height,
			notes: initialValues.notes,
		};
	}, [initialValues]);

	useEffect(() => {
		if (mappedInitialValues) {
			form.setFieldsValue(mappedInitialValues);

			if (mappedInitialValues.img) {
				setImageFileList([
					{
						uid: '-1',
						name: 'profile-image',
						status: 'done',
						url: mappedInitialValues.img,
					},
				]);
			} else {
				setImageFileList([]);
			}
		} else {
			form.resetFields();
			setImageFileList([]);
			form.setFieldValue('img', undefined);
		}
	}, [mappedInitialValues, form]);

	const onFinish = async (values: ClientContactEditFormValues) => {
		try {
			await onSubmit?.(values);
		} catch (error) {
			const err = error instanceof Error ? error : new Error('An error occurred');
			onError?.(err);
		}
	};

	const onReset = () => {
		if (mappedInitialValues) {
			form.setFieldsValue(mappedInitialValues);
			if (mappedInitialValues.img) {
				setImageFileList([
					{
						uid: '-1',
						name: 'profile-image',
						status: 'done',
						url: mappedInitialValues.img,
					},
				]);
			} else {
				setImageFileList([]);
				form.setFieldValue('img', undefined);
			}
		} else {
			form.resetFields();
			setImageFileList([]);
			form.setFieldValue('img', undefined);
		}
	};

	const labelCol = layout === 'horizontal' ? { span: 6 } : undefined;
	const wrapperCol = layout === 'horizontal' ? { span: 18 } : undefined;

	return (
		<div
			style={{
				width: '100%',
				padding: layout === 'vertical' ? '0' : '2rem 0',
			}}
		>
			<Spin spinning={loading}>
				<Form
					initialValues={mappedInitialValues}
					form={form}
					layout={layout}
					labelCol={labelCol}
					wrapperCol={wrapperCol}
					variant="filled"
					name="client-contact-edit-form"
					onFinish={onFinish}
					autoComplete="off"
					style={{
						width: '100%',
					}}
				>
					<Form.Item label="Profile Image" help="Upload a profile photo (JPG, PNG, WEBP).">
						<Upload
							listType="picture"
							accept="image/png,image/jpeg,image/webp"
							multiple={false}
							maxCount={1}
							fileList={imageFileList}
							showUploadList={{ showPreviewIcon: false, showDownloadIcon: false, showRemoveIcon: true }}
							style={{ width: '100%' }}
							beforeUpload={async (file) => {
								const dataUrl = await readFileAsDataUrl(file);
								setImageFileList([
									{
										uid: file.uid,
										name: file.name,
										status: 'done',
										url: dataUrl,
									},
								]);
								form.setFieldValue('img', dataUrl);
								return false;
							}}
							onRemove={() => {
								setImageFileList([]);
								form.setFieldValue('img', undefined);
								return true;
							}}
						>
							{imageFileList.length === 0 && (
								<Button
									htmlType="button"
									icon={<PlusOutlined />}
									style={{ width: '100%', justifyContent: 'flex-start' }}
								>
									Upload image
								</Button>
							)}
						</Upload>
					</Form.Item>

					<Form.Item name="img" hidden>
						<Input />
					</Form.Item>

					{/* First Name Field */}
					<Form.Item
						label="First Name"
						name="firstName"
						rules={[
							{
								required: true,
								message: 'Please enter first name',
							},
							{
								min: 2,
								message: 'First name must be at least 2 characters',
							},
							{
								max: 50,
								message: 'First name must not exceed 50 characters',
							},
						]}
					>
						<Input placeholder="Enter first name" />
					</Form.Item>

					{/* Last Name Field */}
					<Form.Item
						label="Last Name"
						name="lastName"
						rules={[
							{
								required: true,
								message: 'Please enter last name',
							},
							{
								min: 2,
								message: 'Last name must be at least 2 characters',
							},
							{
								max: 50,
								message: 'Last name must not exceed 50 characters',
							},
						]}
					>
						<Input placeholder="Enter last name" />
					</Form.Item>

					{/* Email Field */}
					<Form.Item
						label="Email"
						name="email"
						rules={[
							{
								type: 'email',
								message: 'Please enter a valid email address',
							},
							{
								max: 100,
								message: 'Email must not exceed 100 characters',
							},
						]}
					>
						<Input type="email" placeholder="Enter email address" />
					</Form.Item>

					{/* Phone Field */}
					<Form.Item
						label="Phone"
						name="phoneNumber"
						rules={[
							{
								pattern: /^[\d\s\-+()]+$/,
								message: 'Please enter a valid phone number',
							},
							{
								max: 20,
								message: 'Phone number must not exceed 20 characters',
							},
						]}
					>
						<Input placeholder="Enter phone number" />
					</Form.Item>

					{/* Date of Birth Field */}
					<Form.Item
						label="Date of Birth"
						name="dob"
						rules={[
							{
								validator: (_, value) => {
									if (!value) return Promise.resolve();
									if (value.isAfter(dayjs())) {
										return Promise.reject(new Error('Date of birth cannot be in the future'));
									}
									return Promise.resolve();
								},
							},
						]}
					>
						<DatePicker format="YYYY-MM-DD" placeholder="Select date of birth" style={{ width: '100%' }} />
					</Form.Item>

					{/* Height Field */}
					<Form.Item
						label="Height"
						name="height"
						rules={[
							{
								type: 'number',
								min: 0,
								message: 'Height must be a positive number',
							},
							{
								type: 'number',
								max: 108,
								message: 'Height must not exceed 108 inches',
							},
						]}
					>
						<InputNumber placeholder="Enter height in inches" suffix="in." style={{ width: '100%' }} />
					</Form.Item>

					{/* Notes Field */}
					<Form.Item
						label="Notes"
						name="notes"
						rules={[
							{
								max: 500,
								message: 'Notes must not exceed 500 characters',
							},
						]}
					>
						<Input.TextArea placeholder="Enter client notes" rows={3} maxLength={500} showCount />
					</Form.Item>

					{/* Form Actions */}
					<Form.Item wrapperCol={layout === 'horizontal' ? { offset: 6, span: 18 } : undefined}>
						<Space size="middle" style={{ width: '100%' }}>
							<Button
								type="primary"
								htmlType="submit"
								loading={loading}
								style={{
									minWidth: '120px',
								}}
							>
								{submitButtonText}
							</Button>

							{showReset && (
								<Button htmlType="button" onClick={onReset}>
									Reset
								</Button>
							)}

							{showCancel && (
								<Button
									htmlType="button"
									danger
									onClick={onCancel}
									style={{
										marginLeft: 'auto',
									}}
								>
									Cancel
								</Button>
							)}
						</Space>
					</Form.Item>
				</Form>
			</Spin>
		</div>
	);
}
