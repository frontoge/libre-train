import { Button, Checkbox, DatePicker, Form, Input, Select } from "antd"
import { ClientSearch } from "../clients/ClientSearch";
import { useEffect, useState } from "react";
import { cycleTypeOptions } from "../../helpers/enum-select-options";
import { TrainingCycleType } from "../../../../shared/types";
import dayjs, { Dayjs } from "dayjs";
import { fetchParentMacrocycles, fetchParentMesocycles } from "../../helpers/training-helpers";
import { stringFormatDate } from "../../helpers/date-helpers";

export interface CreateEditTrainingPlanProps extends React.ComponentProps<typeof Form>{
    initialValues?: Partial<CreateEditTrainingPlanFormValues>;
    onSubmit?: (values: CreateEditTrainingPlanFormValues) => void;
}

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
}

type ParentCycle = {
    id: number;
    cycle_name?: string;
    cycle_start_date: Date;
    cycle_end_date: Date;
}

export function CreateEditTrainingPlan(props: CreateEditTrainingPlanProps) {
    const [form] = Form.useForm();
    const [selectedClient, setSelectedClient] = useState<number | undefined>(props.initialValues?.selectedClient);
    const [selectedCycleType, setSelectedCycleType] = useState<TrainingCycleType | undefined>(props.initialValues?.cycleType);
    const [selectedParentCycleId, setSelectedParentCycleId] = useState<number | undefined>(props.initialValues?.parentCycle);
    const [parentCycles, setParentCycles] = useState<ParentCycle[]>([]);

    const isEdit = props.initialValues !== undefined;
    const showRemaingFormFields = selectedClient !== undefined 
        && selectedCycleType !== undefined
        && (
            selectedCycleType === TrainingCycleType.Macrocycle
            || (selectedParentCycleId !== undefined)
        );
    const showParentCycleField = selectedCycleType === TrainingCycleType.Microcycle || selectedCycleType === TrainingCycleType.Mesocycle;

    const parentCycleOptions = parentCycles.map(cycle => ({
        label: cycle.cycle_name ? cycle.cycle_name : `${stringFormatDate(cycle.cycle_start_date)} - ${stringFormatDate(cycle.cycle_end_date)}`,
        value: cycle.id
    }));

    const selectedParentCycle = parentCycles.find(cycle => cycle.id === selectedParentCycleId);

    const fetchParentCycles = async () => {

        if (isEdit || selectedClient === undefined || selectedCycleType === undefined) {
            return;
        }

        if (selectedCycleType === TrainingCycleType.Mesocycle) {
            // Fetch macrocycles for selected client and populate parent cycle select options
            const parentCycles = await fetchParentMacrocycles(selectedClient);
            const options = parentCycles.map(cycle => ({
                id: cycle.id,
                cycle_name: cycle.cycle_name,
                cycle_start_date: cycle.cycle_start_date,
                cycle_end_date: cycle.cycle_end_date
            }))
            setParentCycles(options);
        } else if (selectedCycleType === TrainingCycleType.Microcycle) {
            // Fetch mesocycles for selected client and populate parent cycle select options
            const parentCycles = await fetchParentMesocycles(selectedClient);
            const options = parentCycles.map(cycle => ({
                id: cycle.id,
                cycle_name: cycle.cycle_name,
                cycle_start_date: cycle.cycle_start_date,
                cycle_end_date: cycle.cycle_end_date
            }))
            setParentCycles(options);
        }
    }

    useEffect(() => {
        fetchParentCycles();
    }, [selectedCycleType, selectedClient])

    const onFinish = (values: CreateEditTrainingPlanFormValues) => {
        if (props.onSubmit) {
            props.onSubmit(values);
        }
    }

    const handleClientChange = (clientId?: string) => {
        if (clientId) {
            setSelectedClient(parseInt(clientId));
        } else {
            setSelectedClient(undefined);
        }
    }

    const handleReset = () => {
        form.resetFields();
        setSelectedClient(props.initialValues?.selectedClient);
        setSelectedCycleType(props.initialValues?.cycleType);
        setSelectedParentCycleId(props.initialValues?.parentCycle);
    }

    return (
        <Form 
            form={form}        
            onFinish={onFinish}
            layout="vertical"
            initialValues={props.initialValues}
            {...props}
        >
            <div style={{
                display: isEdit ? 'none' : 'flex',
                gap: '1rem'
            }}>
                <Form.Item required label="Client" name="selectedClient">
                    {/*@ts-ignore*/}
                    <ClientSearch onChange={handleClientChange} style={{width: "12rem"}}/>
                </Form.Item>
                <Form.Item required label="Cycle Type" name="cycleType">
                    <Select 
                        placeholder="Select cycle type"
                        options={cycleTypeOptions}
                        onChange={(value) => setSelectedCycleType(value)}
                        style ={{
                            width: "8rem"
                        }}
                    />
                </Form.Item>
                {
                    showParentCycleField &&
                    <Form.Item required={showParentCycleField} label="Parent Cycle" name="parentCycle">
                        <Select 
                            options={parentCycleOptions}
                            onChange={(value) => setSelectedParentCycleId(value)}
                            placeholder="Select parent cycle"
                            style={{
                                width: "12rem"
                            }}
                        />
                    </Form.Item>
                }
            </div>
            { showRemaingFormFields &&
            <>
                <Form.Item required label="Date Range" name="dateRange">
                    <DatePicker.RangePicker
                        minDate={dayjs(selectedParentCycle?.cycle_start_date)}
                        maxDate={dayjs(selectedParentCycle?.cycle_end_date)}
                    />
                </Form.Item>
                <Form.Item label="Cycle Name" name="cycleName">
                    <Input maxLength={255} placeholder="Name"/>
                </Form.Item>
                <Form.Item layout="horizontal" label="Set Active" name="isActive" valuePropName="checked">
                    <Checkbox /> 
                </Form.Item>
                {   selectedCycleType === TrainingCycleType.Mesocycle &&
                    <>
                        <Form.Item  layout="horizontal" label="OPT levels" name="optLevels">
                            <Checkbox.Group options={Array.from({ length: 5 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }))} />
                        </Form.Item>
                        <Form.Item layout="horizontal" label="Cardio Levels" name="cardioLevels">
                            <Checkbox.Group options={Array.from({ length: 4 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }))} />
                        </Form.Item>
                    </>
                }
                <Form.Item label="Notes" name="notes">
                    <Input.TextArea rows={4} maxLength={512} />
                </Form.Item>
                <Form.Item>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}>
                        <Button type="primary" htmlType="submit">
                            {isEdit ? 'Update' : 'Save'}
                        </Button>
                        <Button style={{ marginLeft: '8px' }} onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </Form.Item>
            </>
            }
        </Form>
    )
}