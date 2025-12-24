import { Input, Select, DatePicker, Slider } from "antd";
import { useContext } from "react";
import { NewPlanContext } from "../../contexts/NewPlanContext";

const { RangePicker } = DatePicker;

export default function AddPlanDetails() {

    const { state: {targetMetricTypes, selectedTargetMetricType, clientOptions}, updateState } = useContext(NewPlanContext);

    const goalMetricOptions = targetMetricTypes?.map(metric => ({
        value: metric.id,
        label: metric.metric_name
    }))

    const clientSelectOptions = clientOptions?.map(client => ({
        value: client.id,
        label: client.first_name + " " + client.last_name
    }))
    
    const stageMarks = {
        50: '1',
    }

    const onClientSearch = (value: string) => {
        
    }

    const handleDateSelect = (dates: any, dateStrings: [string, string]) => {
        console.log(dates, dateStrings);
    };

    const handleMetricSelect = (value: string) => {
        // Handle metric selection
        updateState({ selectedTargetMetricType: targetMetricTypes?.find(metric => metric.id === parseInt(value)) });
    }

    return (
        <>
            <h1 style={{
                alignSelf: 'start'
            }}>Plan Details</h1>
            <Select 
                placeholder="Select Client"
                showSearch
                onSearch={onClientSearch}
                style={{ width: 400 }}
                options={clientSelectOptions}
            >

            </Select>
            <RangePicker style={{width: 400}} onChange={handleDateSelect}/>
            <Input placeholder="Plan Name" style={{ width: 400 }} />
            <Select 
                placeholder="Select Parent Plan (optional)"
                style={{ width: 400 }}
            >
                
            </Select>
            <h3 style={{margin: 0, padding: 0}}>Stage</h3>
            <Slider marks={stageMarks} defaultValue={50} step={null} style={{ width: 400 }}></Slider>
            <Select 
                placeholder="Select Goal Metric"
                style={{ width: 400 }}
                options={goalMetricOptions}
                onChange={handleMetricSelect}
            />
            <Input placeholder="Goal Value" suffix={selectedTargetMetricType?.target_unit} style={{ width: 400 }} />
        </>
    )
}