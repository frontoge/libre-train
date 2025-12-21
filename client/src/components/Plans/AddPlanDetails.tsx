import { Input, Select, DatePicker, Slider } from "antd";

const { RangePicker } = DatePicker;

export default function AddPlanDetails() {

    const onClientSearch = (value: string) => {
    
    }
    
    const stageMarks = {
        0: '0',
        50: '1',
        100: '2',
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
            >

            </Select>
            <RangePicker style={{width: 400}}/>
            <Input placeholder="Plan Name" style={{ width: 400 }} />
            <Select 
                placeholder="Select Parent Plan (optional)"
                style={{ width: 400 }}
            >
                
            </Select>
            <h3 style={{margin: 0, padding: 0}}>Stage</h3>
            <Slider marks={stageMarks} defaultValue={0} step={null} style={{ width: 400 }}></Slider>
            <Select placeholder="Select Goal Metric" style={{ width: 400 }}>
                
            </Select>
            <Input placeholder="Goal Value" style={{ width: 400 }} />
        </>
    )
}