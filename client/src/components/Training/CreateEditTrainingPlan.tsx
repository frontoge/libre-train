import { TrainingCycleType } from '@libre-train/shared';
import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, Row, Select, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { AppContext } from '../../app-context';
import { cycleTypeOptions } from '../../helpers/enum-select-options';
import { fetchClientMacrocycles, fetchClientMesocycles } from '../../helpers/training-helpers';
import { ClientSearch } from '../clients/ClientSearch';

export interface CreateEditTrainingPlanProps extends React.ComponentProps<typeof Form<CreateEditTrainingPlanFormValues>> {
	initialValues?: Partial<CreateEditTrainingPlanFormValues>;
	onSubmit?: (values: CreateEditTrainingPlanFormValues) => void;
}

export type GoalAssessmentFormRow = {
	assessmentTypeId?: number;
	targetValue?: string;
};

export type CreateEditTrainingPlanFormValues = {
	selectedClient: number;
	cycleType: TrainingCycleType;
	parentCycle?: number;
	dateRange: [Dayjs, Dayjs];
	cycleName?: string;
	isActive: boolean;
	optLevels?: number[];
	cardioLevels?: number[];
	notes?: string;
	addGoal?: boolean;
	goalDescription?: string;
	goalTargetDate?: Dayjs;
	goalAssessments?: GoalAssessmentFormRow[];
};

type ParentCycle = {
	id: number;
	cycle_name?: string;
	cycle_start_date: string;
	cycle_end_date: string;
	isActive: boolean;
};

export function CreateEditTrainingPlan(props: CreateEditTrainingPlanProps) {
	const [form] = Form.useForm<CreateEditTrainingPlanFormValues>();
	const { state } = useContext(AppContext);
	const [selectedClient, setSelectedClient] = useState<number | undefined>(props.initialValues?.selectedClient);
	const [selectedCycleType, setSelectedCycleType] = useState<TrainingCycleType | undefined>(props.initialValues?.cycleType);
	const [selectedParentCycleId, setSelectedParentCycleId] = useState<number | undefined>(props.initialValues?.parentCycle);
	const [parentCycles, setParentCycles] = useState<ParentCycle[]>([]);
	const addGoal = Form.useWatch('addGoal', form) ?? false;
	const dateRange = Form.useWatch('dateRange', form);
	const cycleStart = dateRange?.[0];
	const cycleEnd = dateRange?.[1];

	const isEdit = props.initialValues !== undefined;
	const showRemaingFormFields =
		selectedClient !== undefined
		&& selectedCycleType !== undefined
		&& (selectedCycleType === TrainingCycleType.Macrocycle || selectedParentCycleId !== undefined);
	const showParentCycleField =
		selectedCycleType === TrainingCycleType.Microcycle || selectedCycleType === TrainingCycleType.Mesocycle;

	const parentCycleOptions = parentCycles.map((cycle) => ({
		label:
			(cycle.cycle_name ? cycle.cycle_name : `${cycle.cycle_start_date} - ${cycle.cycle_end_date}`)
			+ (!cycle.isActive ? '*' : ''),
		value: cycle.id,
	}));

	const selectedParentCycle = parentCycles.find((cycle) => cycle.id === selectedParentCycleId);

	const fetchParentCycles = async () => {
		if (isEdit || selectedClient === undefined || selectedCycleType === undefined) {
			return;
		}

		setSelectedParentCycleId(undefined);
		form.resetFields(['parentCycle', 'dateRange', 'optLevels', 'cardioLevels', 'isActive', 'cycleName', 'notes']);

		if (selectedCycleType === TrainingCycleType.Mesocycle) {
			// Fetch macrocycles for selected client and populate parent cycle select options
			const parentCycles = await fetchClientMacrocycles(selectedClient);
			const options = parentCycles.map((cycle) => ({
				id: cycle.id,
				cycle_name: cycle.cycle_name,
				cycle_start_date: cycle.cycle_start_date,
				cycle_end_date: cycle.cycle_end_date,
				isActive: cycle.is_active,
			}));
			setParentCycles(options);
		} else if (selectedCycleType === TrainingCycleType.Microcycle) {
			// Fetch mesocycles for selected client and populate parent cycle select options
			const parentCycles = await fetchClientMesocycles(selectedClient);
			const options = parentCycles.map((cycle) => ({
				id: cycle.id,
				cycle_name: cycle.cycle_name,
				cycle_start_date: cycle.cycle_start_date,
				cycle_end_date: cycle.cycle_end_date,
				isActive: cycle.is_active,
			}));
			setParentCycles(options);
		}
	};

	useEffect(() => {
		fetchParentCycles();
	}, [selectedCycleType, selectedClient]);

	// When the user enables Attach Goal, default the target date to the cycle's end date.
	useEffect(() => {
		if (!addGoal) return;
		const current = form.getFieldValue('goalTargetDate') as Dayjs | undefined;
		if (!current && cycleEnd) {
			form.setFieldValue('goalTargetDate', cycleEnd);
		}
	}, [addGoal, cycleEnd, form]);

	const onFinish = (values: CreateEditTrainingPlanFormValues) => {
		if (props.onSubmit) {
			props.onSubmit(values);
		}
	};

	const handleClientChange = (clientId?: string) => {
		if (clientId) {
			setSelectedClient(parseInt(clientId));
		} else {
			setSelectedClient(undefined);
		}
	};

	const handleReset = () => {
		form.resetFields();
		setSelectedClient(props.initialValues?.selectedClient);
		setSelectedCycleType(props.initialValues?.cycleType);
		setSelectedParentCycleId(props.initialValues?.parentCycle);
	};

	return (
		<Form<CreateEditTrainingPlanFormValues>
			form={form}
			onFinish={onFinish}
			layout="vertical"
			initialValues={props.initialValues}
			{...props}
		>
			<div
				style={{
					display: isEdit ? 'none' : 'flex',
					gap: '1rem',
				}}
			>
				<Form.Item required label="Client" name="selectedClient">
					{/*@ts-ignore*/}
					<ClientSearch onChange={handleClientChange} style={{ width: '12rem' }} />
				</Form.Item>
				<Form.Item required label="Cycle Type" name="cycleType">
					<Select
						placeholder="Select cycle type"
						options={cycleTypeOptions}
						onChange={(value) => setSelectedCycleType(value)}
						style={{
							width: '8rem',
						}}
					/>
				</Form.Item>
				{showParentCycleField && (
					<Form.Item required={showParentCycleField} label="Parent Cycle" name="parentCycle">
						<Select
							options={parentCycleOptions}
							onChange={(value) => setSelectedParentCycleId(value)}
							value={selectedParentCycleId}
							placeholder="Select parent cycle"
							style={{
								width: '12rem',
							}}
						/>
					</Form.Item>
				)}
			</div>
			{showRemaingFormFields && (
				<>
					<Form.Item required label="Date Range" name="dateRange">
						<DatePicker.RangePicker
							minDate={selectedParentCycle !== undefined ? dayjs(selectedParentCycle?.cycle_start_date) : undefined}
							maxDate={selectedParentCycle !== undefined ? dayjs(selectedParentCycle?.cycle_end_date) : undefined}
						/>
					</Form.Item>
					<Form.Item label="Cycle Name" name="cycleName">
						<Input maxLength={255} placeholder="Name" />
					</Form.Item>
					<Form.Item layout="horizontal" label="Set Active" name="isActive" valuePropName="checked">
						<Checkbox />
					</Form.Item>
					{selectedCycleType === TrainingCycleType.Mesocycle && (
						<>
							<Form.Item layout="horizontal" label="OPT levels" name="optLevels">
								<Checkbox.Group
									options={Array.from({ length: 5 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }))}
								/>
							</Form.Item>
							<Form.Item layout="horizontal" label="Cardio Levels" name="cardioLevels">
								<Checkbox.Group
									options={Array.from({ length: 4 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }))}
								/>
							</Form.Item>
						</>
					)}
					<Form.Item label="Notes" name="notes">
						<Input.TextArea rows={4} maxLength={512} />
					</Form.Item>
					{!isEdit && (
						<>
							<Divider style={{ margin: '1rem 0' }} />
							<Form.Item layout="horizontal" label="Attach Goal" name="addGoal" valuePropName="checked">
								<Checkbox />
							</Form.Item>
							{addGoal && (
								<div>
									<Form.Item label="Goal Description" name="goalDescription">
										<Input.TextArea rows={3} maxLength={512} placeholder="What should this cycle achieve?" />
									</Form.Item>
									<Form.Item
										label="Target Date"
										name="goalTargetDate"
										extra={
											cycleStart && cycleEnd
												? `Bounded to cycle: ${cycleStart.format('YYYY-MM-DD')} – ${cycleEnd.format('YYYY-MM-DD')}`
												: 'Pick a date range above first'
										}
									>
										<DatePicker
											style={{ width: '100%' }}
											minDate={cycleStart}
											maxDate={cycleEnd}
											disabled={!cycleStart || !cycleEnd}
										/>
									</Form.Item>
									<Typography.Title level={5} style={{ marginBottom: '0.5rem' }}>
										Metrics
									</Typography.Title>
									<Form.List name="goalAssessments" initialValue={[{}]}>
										{(fields, { add, remove }) => (
											<Space orientation="vertical" style={{ width: '100%' }} size="small">
												{fields.map(({ key, name }) => (
													<Row key={key} gutter={[8, 0]} align="top" wrap>
														<Col xs={24} sm={12}>
															<Form.Item
																name={[name, 'assessmentTypeId']}
																rules={[{ required: true, message: 'Pick an assessment' }]}
																style={{ marginBottom: 8 }}
															>
																<Select
																	showSearch={{ optionFilterProp: 'label' }}
																	placeholder="Assessment"
																	options={state.assessmentTypes.map((type) => ({
																		value: type.id,
																		label: type.assessmentUnit
																			? `${type.name} (${type.assessmentUnit})`
																			: type.name,
																	}))}
																/>
															</Form.Item>
														</Col>
														<Col xs={20} sm={10}>
															<Form.Item
																name={[name, 'targetValue']}
																rules={[{ required: true, message: 'Enter a target' }]}
																style={{ marginBottom: 8 }}
															>
																<Input maxLength={500} placeholder="Target value (e.g. 315)" />
															</Form.Item>
														</Col>
														<Col xs={4} sm={2}>
															<Button
																type="text"
																icon={<FaTrash />}
																onClick={() => remove(name)}
																disabled={fields.length === 1}
																aria-label="Remove metric"
															/>
														</Col>
													</Row>
												))}
												<Button type="dashed" icon={<FaPlus />} onClick={() => add({})} block>
													Add additional metric
												</Button>
											</Space>
										)}
									</Form.List>
								</div>
							)}
						</>
					)}
					<Form.Item>
						<div
							style={{
								display: 'flex',
								justifyContent: 'flex-end',
							}}
						>
							<Button type="primary" htmlType="submit">
								{isEdit ? 'Update' : 'Save'}
							</Button>
							<Button style={{ marginLeft: '8px' }} onClick={handleReset}>
								Reset
							</Button>
						</div>
					</Form.Item>
				</>
			)}
		</Form>
	);
}
