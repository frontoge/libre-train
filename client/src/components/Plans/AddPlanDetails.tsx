import { Input, Select, DatePicker, Slider } from "antd";
import { useContext } from "react";
import { NewPlanContext, type RangeValueType } from "../../contexts/NewPlanContext";
import type { Client } from "../../../../shared/types";
import type dayjs from "dayjs";

const { RangePicker } = DatePicker;

export default function AddPlanDetails() {

    // State
    const { state: {
        targetMetricTypes,
        selectedTargetMetricType,
        clientOptions,
        selectedDateRange,
        targetMetricValue,
        planName,
        selectedClientId
    }, updateState } = useContext(NewPlanContext);

    const selectedClient: Client | undefined = clientOptions?.find(client => client.id === selectedClientId!);

    // Input options
    const goalMetricOptions = targetMetricTypes?.map(metric => ({
        value: metric.id,
        label: metric.metric_name
    }))

    const clientKeyToIdMap = clientOptions?.reduce((map, client) => {
        map[client.first_name + client.last_name] = client.id;
        return map;
    }, {} as Record<string, number>);

    const clientSelectOptions = clientOptions?.map(client => ({
        value: client.first_name + client.last_name,
        label: client.first_name + " " + client.last_name
    }))
    
    const stageMarks: Record<number, string> = {
        50: '1',
    }

    // input handlers
    const handleClientSelect = (value: string) => {
        updateState({ selectedClientId: (clientKeyToIdMap ?? {})[value] ?? 0 });
    }

    const handleDateSelect = (dates: RangeValueType<dayjs.Dayjs>, dateStrings: [string, string]) => {
        updateState({ selectedDates: dateStrings, selectedDateRange: dates });
    };

    const handleMetricSelect = (value: string) => {
        // Handle metric selection
        updateState({ selectedTargetMetricType: targetMetricTypes?.find(metric => metric.id === parseInt(value)) });
    }

    const handlePlanNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateState({ planName: e.target.value });
    }

    const handleParentPlanSelect = (value: string) => {
        updateState({ parentPlanId: parseInt(value) });
    }

    const handleStageChange = (value: number) => {
        updateState({ planStage: parseInt(stageMarks[value], 10)});
        // updateState({ planStage: (value / 50) });
    }

    const handleGoalValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("Goal value changed:", e.target.value);
        updateState({ targetMetricValue: parseFloat(e.target.value) });
    }

    return (
        <>
            <h1>Plan Details</h1>
            <Select 
                placeholder="Select Client"
                showSearch
                style={{ width: 400 }}
                options={clientSelectOptions}
                onChange={handleClientSelect}
                value={selectedClient ? selectedClient.first_name + selectedClient.last_name : undefined}
            >

            </Select>
            <RangePicker style={{width: 400}} onChange={handleDateSelect} value={selectedDateRange} />
            <Input placeholder="Plan Name" style={{ width: 400 }} onChange={handlePlanNameChange} value={planName} />
            <Select 
                placeholder="Select Parent Plan (optional)"
                style={{ width: 400 }}
                onChange={handleParentPlanSelect}
            >
                
            </Select>
            <h3 style={{margin: 0, padding: 0}}>Stage</h3>
            <Slider marks={stageMarks} disabled defaultValue={50} step={null} style={{ width: 400 }} onChange={handleStageChange}></Slider>
            <Select 
                placeholder="Select Goal Metric"
                style={{ width: 400 }}
                options={goalMetricOptions}
                onChange={handleMetricSelect}
                value={selectedTargetMetricType?.metric_name}
            />
            <Input 
                placeholder="Goal Value"
                suffix={selectedTargetMetricType?.target_unit}
                onChange={handleGoalValueChange}
                style={{ width: 400 }}
                value={targetMetricValue}
            />
        </>
    )
}