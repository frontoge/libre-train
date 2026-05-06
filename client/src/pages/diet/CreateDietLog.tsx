import type { ClientDietPlan } from '@libre-train/shared';
import { Button, DatePicker, Form, Input, InputNumber } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ClientSearch } from '../../components/clients/ClientSearch';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { createDietLogEntry, fetchClientDietPlan } from '../../helpers/api';
import { useMessage } from '../../hooks/useMessage';

interface CreateDietLogFormValues {
	date?: Dayjs;
	calories: number;
	protein: number;
	carbs: number;
	fats: number;
}

export function CreateDietLog() {
	const [form] = Form.useForm();
	const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
	const [clientPlan, setClientPlan] = useState<ClientDietPlan | undefined>(undefined);
	const showMessage = useMessage();

	const formItemStyle = {
		width: '100%',
	};

	const formInputStyle = {
		width: '100%',
	};

	const fetchClientPlan = async (clientId: string) => {
		const response = await fetchClientDietPlan(parseInt(clientId));
		setClientPlan(response);
	};

	const handleFinish = async (values: CreateDietLogFormValues) => {
		if (!selectedClient) {
			console.error('No client selected');
			showMessage('error', 'No client selected');
			return;
		}
		const { date, calories, protein, carbs, fats } = values;
		if (calories === undefined || protein === undefined || carbs === undefined || fats === undefined) {
			console.error('Missing required fields');
			showMessage('error', 'Please fill in all required fields');
			return;
		}

		const requestBody = {
			clientId: parseInt(selectedClient),
			logDate: date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
			calories,
			protein,
			carbs,
			fats,
		};
		try {
			await createDietLogEntry(requestBody);
			form.resetFields();
			setClientPlan(undefined);
			setSelectedClient(undefined);
			showMessage('success', 'Diet log entry created successfully');
		} catch (error) {
			console.error('Error creating diet log entry:', error);
			showMessage('error', 'Failed to create diet log entry');
		}
	};

	useEffect(() => {
		if (!selectedClient) {
			setClientPlan(undefined);
			return;
		}
		fetchClientPlan(selectedClient);
	}, [selectedClient]);

	return (
		<PageLayout
			title="New Diet Log"
			contentStyle={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '2rem',
			}}
		>
			<Panel
				style={{
					width: '50%',
					height: '100%',
					padding: '2rem',
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Form
					form={form}
					layout="vertical"
					onFinish={handleFinish}
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						height: '100%',
						width: '60%',
					}}
				>
					<Form.Item label="Client" style={{ width: '40%' }}>
						<ClientSearch onClientSelect={(client) => setSelectedClient(client)} value={selectedClient} />
					</Form.Item>
					<div
						style={{
							display: selectedClient ? 'grid' : 'none',
							gridTemplateColumns: 'repeat(2, 1fr)',
							gridTemplateRows: 'repeat(5, auto)',
							flexGrow: 1,
							gap: '1rem',
							width: '100%',
						}}
					>
						<Form.Item label="Date" name="date" style={{ width: '100%' }}>
							<DatePicker style={{ width: '100%' }} />
						</Form.Item>
						<Form.Item label="Plan Name" style={formItemStyle}>
							<Input
								value={clientPlan?.planName ?? 'No Active Plan'}
								variant="borderless"
								disabled
								style={formInputStyle}
							/>
						</Form.Item>

						<Form.Item required label="Calories" name="calories" style={formItemStyle}>
							<InputNumber suffix="kcal" style={formInputStyle} />
						</Form.Item>
						<Form.Item label="Target" style={formItemStyle}>
							<InputNumber suffix="kcal" disabled value={clientPlan?.targetCalories} style={formInputStyle} />
						</Form.Item>

						<Form.Item required label="Protein" name="protein" style={formItemStyle}>
							<InputNumber suffix="g" style={formInputStyle} />
						</Form.Item>
						<Form.Item label="Target" style={formItemStyle}>
							<InputNumber suffix="g" disabled value={clientPlan?.targetProtein} style={formInputStyle} />
						</Form.Item>

						<Form.Item required label="Carbs" name="carbs" style={formItemStyle}>
							<InputNumber suffix="g" style={formInputStyle} />
						</Form.Item>
						<Form.Item label="Target" style={formItemStyle}>
							<InputNumber suffix="g" disabled value={clientPlan?.targetCarbs} style={formInputStyle} />
						</Form.Item>

						<Form.Item required label="Fats" name="fats" style={formItemStyle}>
							<InputNumber suffix="g" style={formInputStyle} />
						</Form.Item>
						<Form.Item label="Target" style={formItemStyle}>
							<InputNumber suffix="g" disabled value={clientPlan?.targetFats} style={formInputStyle} />
						</Form.Item>
					</div>
					<Form.Item label="Plan Notes" style={{ ...formItemStyle, display: selectedClient ? 'block' : 'none' }}>
						<TextArea placeholder="Notes" disabled rows={4} style={{ width: '100%' }} value={clientPlan?.notes} />
					</Form.Item>
					<Form.Item style={{ ...formItemStyle, display: selectedClient ? 'block' : 'none' }}>
						<div
							style={{
								display: 'flex',
								justifyContent: 'end',
								width: '100%',
								gap: '1rem',
							}}
						>
							<Button type="primary" htmlType="submit">
								Save Log
							</Button>
							<Button htmlType="button" onClick={() => form.resetFields()}>
								Reset
							</Button>
						</div>
					</Form.Item>
				</Form>
			</Panel>
		</PageLayout>
	);
}
