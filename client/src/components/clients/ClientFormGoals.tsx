import { Select, DatePicker, InputNumber } from "antd";
import { useState, useContext } from "react";
import { AddClientFormContext } from "../../contexts/AddClientFormContext";
import { type Goal } from "../../../../shared/types";

export default function ClientFormInformation() {

    const { formValues, setFormValues } = useContext(AddClientFormContext);

    // TODO get from database/cache
    const [goalOptions, setGoalOptions] = useState<Goal[]>([
        { id: 0, goal: 'Select Goal' },
        { id: 1, goal: 'Weight Loss' },
        { id: 2, goal: 'Muscle Gain' },
        { id: 3, goal: 'General Health' },
        { id: 4, goal: 'Improve Strength' },
        { id: 5, goal: 'Improve endurance' },
        { id: 6, goal: 'BodyBuilding' },
        { id: 7, goal: 'Powerlifting' },
        { id: 8, goal: 'Other' }
    ]);

    return (
        <div style={{
            height: '50%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
        }}>
            <h3 style={{
                margin: 0,
                alignSelf: 'center',
                fontSize: '1.5rem'
            }}>
                Goals/Targets
            </h3>
            <div style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'repeat(3, 1fr)',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <Select
                    placeholder="Select Goal"
                    options={goalOptions.map(goal => ({ label: goal.goal, value: goal.id }))}
                    onSelect={(value) => setFormValues(prev => ({...prev, goals: {...prev.goals, goal: value}}))}
                    value={formValues.goals.goal}
                />
                <div></div>
                <InputNumber placeholder="Target Weight" style={{ width: '100%' }} min={0} suffix={"lbs"} value={formValues.goals.targetWeight} onChange={(val) => setFormValues(prev => ({...prev, goals: {...prev.goals, targetWeight: val === null ? undefined : val}}))} />
                <InputNumber placeholder="Target Body Fat" style={{ width: '100%' }} min={0} max={100} suffix={"%"} value={formValues.goals.targetBodyFat} onChange={(val) => setFormValues(prev => ({...prev, goals: {...prev.goals, targetBodyFat: val === null ? undefined : val}}))} />
                <InputNumber placeholder="Target Lean Mass" style={{ width: '100%' }} min={0} suffix={"lbs"} value={formValues.goals.targetLeanMass} onChange={(val) => setFormValues(prev => ({...prev, goals: {...prev.goals, targetLeanMass: val === null ? undefined : val}}))} />
                <DatePicker placeholder="Target Date" style={{ width: '100%' }} value={formValues.goals.targetDate} onChange={(date) => setFormValues(prev => ({...prev, goals: {...prev.goals, targetDate: date}}))} />
            </div>
        </div>
    )
}