import type {
	ClientGoalWithRelations,
	CreateClientGoalRequest,
	GoalAssessmentInput,
	Macrocycle,
	Mesocycle,
	Microcycle,
	UpdateClientGoalRequest,
} from '@libre-train/shared';
import { CycleLevel } from '@libre-train/shared';
import { Button, Col, DatePicker, Form, Input, Row, Select, Space, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useContext, useEffect, useMemo, useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { AppContext } from '../../app-context';
import { fetchClientMacrocycles, fetchClientMesocycles, fetchClientMicrocycles } from '../../helpers/training-helpers';

type CycleOption = {
	id: number;
	cycle_name?: string;
	cycle_start_date: string;
	cycle_end_date: string;
	is_active: boolean;
};

type AssessmentRow = {
	assessmentTypeId?: number;
	targetValue?: string;
};

export type GoalFormValues = {
	clientId?: number;
	cycleLevel: CycleLevel;
	cycleId: number;
	description?: string;
	targetDate?: Dayjs;
	assessments: AssessmentRow[];
};

export interface GoalFormProps {
	/** Pre-selected client. When omitted, the form renders a client picker as the first field. */
	clientId?: number;
	initialValues?: Partial<GoalFormValues>;
	existingGoal?: ClientGoalWithRelations;
	/** Hide the cycle picker when the parent cycle is already known (e.g. embedded in cycle creation). */
	lockedCycle?: { level: CycleLevel; id?: number };
	submitLabel?: string;
	onSubmit: (body: CreateClientGoalRequest | UpdateClientGoalRequest, isEdit: boolean) => Promise<void> | void;
	onCancel?: () => void;
}

const cycleLevelOptions: { value: CycleLevel; label: string }[] = [
	{ value: CycleLevel.Macrocycle, label: 'Macrocycle' },
	{ value: CycleLevel.Mesocycle, label: 'Mesocycle' },
	{ value: CycleLevel.Microcycle, label: 'Microcycle' },
];

const toCycleOption = (cycle: Macrocycle | Mesocycle | Microcycle): CycleOption => ({
	id: cycle.id,
	cycle_name: cycle.cycle_name,
	cycle_start_date: cycle.cycle_start_date,
	cycle_end_date: cycle.cycle_end_date,
	is_active: cycle.is_active,
});

const inferInitialValues = (existingGoal?: ClientGoalWithRelations): Partial<GoalFormValues> => {
	if (!existingGoal) return {};
	let cycleLevel: CycleLevel = CycleLevel.Macrocycle;
	let cycleId: number | undefined;
	if (existingGoal.macrocycle_id) {
		cycleLevel = CycleLevel.Macrocycle;
		cycleId = existingGoal.macrocycle_id;
	} else if (existingGoal.mesocycle_id) {
		cycleLevel = CycleLevel.Mesocycle;
		cycleId = existingGoal.mesocycle_id;
	} else if (existingGoal.microcycle_id) {
		cycleLevel = CycleLevel.Microcycle;
		cycleId = existingGoal.microcycle_id;
	}
	return {
		cycleLevel,
		cycleId,
		description: existingGoal.description,
		targetDate: existingGoal.target_date ? dayjs(existingGoal.target_date) : undefined,
		assessments: existingGoal.assessments.map((assessment) => ({
			assessmentTypeId: assessment.assessment_type_id,
			targetValue: assessment.target_value,
		})),
	};
};

export function GoalForm(props: GoalFormProps) {
	const { clientId: lockedClientId, existingGoal, lockedCycle, onSubmit, onCancel } = props;
	const { state } = useContext(AppContext);
	const [form] = Form.useForm<GoalFormValues>();
	const [submitting, setSubmitting] = useState(false);
	const [cycleOptions, setCycleOptions] = useState<CycleOption[]>([]);
	const isEdit = existingGoal !== undefined;
	const showClientPicker = lockedClientId === undefined && !isEdit;

	const mergedInitial: Partial<GoalFormValues> = useMemo(
		() => ({
			cycleLevel: lockedCycle?.level ?? CycleLevel.Macrocycle,
			cycleId: lockedCycle?.id,
			clientId: lockedClientId,
			assessments: [{}],
			...inferInitialValues(existingGoal),
			...props.initialValues,
		}),
		[existingGoal, lockedCycle?.level, lockedCycle?.id, lockedClientId, props.initialValues]
	);

	const currentCycleLevel: CycleLevel = Form.useWatch('cycleLevel', form) ?? mergedInitial.cycleLevel ?? CycleLevel.Macrocycle;
	const watchedClientId = Form.useWatch('clientId', form);
	const watchedCycleId = Form.useWatch('cycleId', form);
	const activeClientId = lockedClientId ?? existingGoal?.client_id ?? watchedClientId;

	const selectedCycle = useMemo(
		() => cycleOptions.find((cycle) => cycle.id === watchedCycleId),
		[cycleOptions, watchedCycleId]
	);

	useEffect(() => {
		form.setFieldsValue(mergedInitial);
	}, [mergedInitial, form]);

	useEffect(() => {
		if (lockedCycle) return;
		if (activeClientId === undefined) {
			setCycleOptions([]);
			return;
		}
		let cancelled = false;
		const loadCycles = async () => {
			const cycles: CycleOption[] =
				currentCycleLevel === CycleLevel.Macrocycle
					? (await fetchClientMacrocycles(activeClientId)).map(toCycleOption)
					: currentCycleLevel === CycleLevel.Mesocycle
						? (await fetchClientMesocycles(activeClientId)).map(toCycleOption)
						: (await fetchClientMicrocycles({ clientId: activeClientId })).map(toCycleOption);
			if (!cancelled) setCycleOptions(cycles);
		};
		loadCycles();
		return () => {
			cancelled = true;
		};
	}, [activeClientId, currentCycleLevel, lockedCycle]);

	// When user picks a cycle, default target date to the cycle's end date (only when not already set).
	useEffect(() => {
		if (!selectedCycle) return;
		const current = form.getFieldValue('targetDate') as Dayjs | undefined;
		if (!current) {
			form.setFieldValue('targetDate', dayjs(selectedCycle.cycle_end_date));
		}
	}, [selectedCycle, form]);

	const cycleSelectOptions = cycleOptions.map((cycle) => ({
		label:
			(cycle.cycle_name ?? `${cycle.cycle_start_date} – ${cycle.cycle_end_date}`) + (cycle.is_active ? '' : ' (inactive)'),
		value: cycle.id,
	}));

	const assessmentOptions = state.assessmentTypes.map((type) => ({
		value: type.id,
		label: type.assessmentUnit ? `${type.name} (${type.assessmentUnit})` : type.name,
	}));

	const handleFinish = async (values: GoalFormValues) => {
		setSubmitting(true);
		try {
			const macroId = values.cycleLevel === CycleLevel.Macrocycle ? values.cycleId : undefined;
			const mesoId = values.cycleLevel === CycleLevel.Mesocycle ? values.cycleId : undefined;
			const microId = values.cycleLevel === CycleLevel.Microcycle ? values.cycleId : undefined;

			const assessments: GoalAssessmentInput[] = (values.assessments ?? [])
				.filter((row): row is Required<AssessmentRow> => row?.assessmentTypeId !== undefined && !!row.targetValue?.trim())
				.map((row) => ({ assessment_type_id: row.assessmentTypeId, target_value: row.targetValue.trim() }));

			if (isEdit) {
				const body: UpdateClientGoalRequest = {
					macrocycle_id: macroId,
					mesocycle_id: mesoId,
					microcycle_id: microId,
					description: values.description,
					target_date: values.targetDate ? values.targetDate.format('YYYY-MM-DD') : undefined,
					assessments,
				};
				await onSubmit(body, true);
			} else {
				const resolvedClientId = lockedClientId ?? values.clientId;
				if (resolvedClientId === undefined) return;
				const body: CreateClientGoalRequest = {
					client_id: resolvedClientId,
					macrocycle_id: macroId,
					mesocycle_id: mesoId,
					microcycle_id: microId,
					description: values.description,
					target_date: values.targetDate ? values.targetDate.format('YYYY-MM-DD') : undefined,
					assessments,
				};
				await onSubmit(body, false);
			}
		} finally {
			setSubmitting(false);
		}
	};

	const cycleMin = selectedCycle ? dayjs(selectedCycle.cycle_start_date) : undefined;
	const cycleMax = selectedCycle ? dayjs(selectedCycle.cycle_end_date) : undefined;

	return (
		<Form<GoalFormValues> form={form} layout="vertical" initialValues={mergedInitial} onFinish={handleFinish}>
			{showClientPicker && (
				<Form.Item label="Client" name="clientId" rules={[{ required: true, message: 'Select a client' }]}>
					<Select
						placeholder="Select a client"
						showSearch={{ optionFilterProp: 'label' }}
						options={state.clients.map((client) => ({
							value: client.ClientId,
							label: `${client.first_name} ${client.last_name}`,
						}))}
						onChange={() => form.setFieldValue('cycleId', undefined)}
					/>
				</Form.Item>
			)}
			{!lockedCycle && (
				<Row gutter={[16, 0]}>
					<Col xs={24} sm={8}>
						<Form.Item
							label="Cycle Level"
							name="cycleLevel"
							rules={[{ required: true, message: 'Select a cycle level' }]}
						>
							<Select
								options={cycleLevelOptions}
								onChange={() => form.setFieldValue('cycleId', undefined)}
								disabled={isEdit}
							/>
						</Form.Item>
					</Col>
					<Col xs={24} sm={16}>
						<Form.Item label="Cycle" name="cycleId" rules={[{ required: true, message: 'Select a cycle' }]}>
							<Select
								options={cycleSelectOptions}
								placeholder={activeClientId === undefined ? 'Select a client first' : 'Select a cycle'}
								showSearch={{ optionFilterProp: 'label' }}
								disabled={isEdit || activeClientId === undefined}
							/>
						</Form.Item>
					</Col>
				</Row>
			)}

			<Form.Item label="Description" name="description">
				<Input.TextArea rows={3} maxLength={512} placeholder="What should this cycle achieve?" />
			</Form.Item>

			<Form.Item
				label="Target Date"
				name="targetDate"
				extra={
					selectedCycle
						? `Bounded to cycle: ${selectedCycle.cycle_start_date} – ${selectedCycle.cycle_end_date}`
						: undefined
				}
			>
				<DatePicker
					style={{ width: '100%' }}
					minDate={cycleMin}
					maxDate={cycleMax}
					disabled={!selectedCycle && !isEdit}
				/>
			</Form.Item>

			<Typography.Title level={5} style={{ marginBottom: '0.5rem' }}>
				Metrics
			</Typography.Title>
			<Form.List name="assessments">
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
											options={assessmentOptions}
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

			<Form.Item style={{ marginTop: '1rem', marginBottom: 0 }}>
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
					{onCancel && <Button onClick={onCancel}>Cancel</Button>}
					<Button type="primary" htmlType="submit" loading={submitting}>
						{props.submitLabel ?? (isEdit ? 'Save' : 'Create')}
					</Button>
				</div>
			</Form.Item>
		</Form>
	);
}
