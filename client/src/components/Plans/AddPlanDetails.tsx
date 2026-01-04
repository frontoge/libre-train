import { Input, Select, DatePicker, Slider } from "antd";
import { useContext, useEffect } from "react";
import { NewPlanContext, type RangeValueType } from "../../contexts/NewPlanContext";
import type { Client } from "../../../../shared/types";
import type dayjs from "dayjs";
import { Routes } from "../../../../shared/routes";
import { getAppConfiguration } from "../../config/app.config";
import { AppContext } from "../../app-context";

const { RangePicker } = DatePicker;

export default function AddPlanDetails() {

    // State
    const { state: {
        targetMetricTypes,
        selectedTargetMetricType,
        selectedDateRange,
        targetMetricValue,
        planName,
        selectedClientId,
        existingPlans,
        parentPlanId,
        planStage
    }, updateState } = useContext(NewPlanContext);

    const {state: {clients}} = useContext(AppContext)

    const selectedClient: Client | undefined = clients?.find(client => client.id === selectedClientId!);

    // Input options
    const goalMetricOptions = targetMetricTypes?.map(metric => ({
        value: metric.id,
        label: metric.metric_name
    }))

    const clientKeyToIdMap = clients?.reduce((map, client) => {
        map[client.first_name + client.last_name] = client.id;
        return map;
    }, {} as Record<string, number>);

    const clientSelectOptions = clients?.map(client => ({
        value: client.first_name + client.last_name,
        label: client.first_name + " " + client.last_name
    }))

    const parentPlanOptions = existingPlans?.map(plan => ({
        value: plan.id.toString(),
        label: plan.planName
    }))

    const planStageCount = existingPlans?.filter((plan) => plan.parentPlanId === parentPlanId).length ?? 0;

    const planStageOptions = parentPlanId ? Array.from({ length: planStageCount + 1}, (val, index) => ({
        value: (index + 1).toString(),
        label: `Stage ${index + 1}`
    })) : [];

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
        updateState({ planStage: value });
    }

    const handleGoalValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        updateState({ targetMetricValue: isNaN(value) ? undefined : value });
    }

    useEffect(() => {
        if (!selectedClientId) return;
        const fetchClientPlans = async (clientId: number) => {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.ClientPlan}/${clientId}`, requestOptions);
            if (response.ok) {
                const data = await response.json();
                updateState({ existingPlans: data });
            }
        }

        fetchClientPlans(selectedClientId as number);
    }, [selectedClientId]);

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
                options={parentPlanOptions}
                disabled={existingPlans === undefined || existingPlans.length === 0}
                onChange={handleParentPlanSelect}
            >
                
            </Select>
            <Select
                placeholder="Select Plan Stage"
                style={{ width: 400 }}
                onChange={(value) => handleStageChange(parseInt(value))}
                disabled={parentPlanId === undefined}
                options={planStageOptions}
                value={planStage?.toString()}
            >

            </Select>
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