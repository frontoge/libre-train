import { Button, Input, Select, Steps, Timeline } from "antd";
import React from "react";
import PlanExercise from "./PlanExercise";
import "../../styles/index.css";
import { AppContext } from "../../app-context";


export default function AddPlanDays() {
    const [days, setDays] = React.useState([])
    const [selectedDay, setSelectedDay] = React.useState(0);
    const { state: {workoutRoutineStages} } = React.useContext(AppContext);

    const [dayRoutineItems, setDayRoutineItems] = React.useState([
        {
            color: 'purple',
            children: (
            <div>
                <span style={{fontWeight: 'bold'}}>Warmup</span>
                <PlanExercise />
                <PlanExercise />
                <PlanExercise />

            </div>)
        },
        
        {
            color: 'green',
            children: (
            <div>
                <span style={{fontWeight: 'bold'}}>Skill Development</span>
                <PlanExercise />
                <PlanExercise />
                <PlanExercise />

            </div>)
        },
        {
            color: 'cyan',
            children: (
            <div>
                <span style={{fontWeight: 'bold'}}>Resistance Training</span>
                <PlanExercise />
                <PlanExercise />
                <PlanExercise />
                <PlanExercise />
                <PlanExercise />
                <PlanExercise />

            </div>),
        },
        {
            color: 'red',
            children: 'Cooldown'
        }
    ])

    const handleNewDay = () => {
        setDays([...days, {}]);
    }

    const handleDeleteDay = () => {
        if (days.length === 0) return;
        const newDays = days.slice(0, days.length - 1);
        setDays(newDays);
    }

    const onSelectDay = (index: number) => {
        setSelectedDay(index);
    }

    const workoutStageOptions = workoutRoutineStages.map(stage => ({
        label: stage.stage_name,
        value: stage.id
    }));

    return (
        <>   
            <h1 style={{
                alignSelf: 'start'
            }}>Plan Workouts</h1>
            <Steps size="small" current={selectedDay} onChange={onSelectDay} items={days}/>
            <div className="dayButtonGroup" style={{
                display: 'flex',
                flexDirection: 'row',
                alignSelf: 'end',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <Button onClick={handleDeleteDay} type="primary" danger>Remove Day</Button>
                <Button onClick={handleNewDay} type="primary">Add Day</Button>
            </div>
            {days.length > 0 && <><Input placeholder="Day Name" style={{ width: 300 }} />
            <div
                className="routineBuilder"
                style={{
                    width: '100%',
                    maxHeight: '500px',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: '2rem',
                    gap: '2rem',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: '60%',
                        height: '100%',
                        overflowY: 'auto',
                        background: 'transparent',
                        borderRadius: 8,
                        scrollbarWidth: 'thin', // Firefox
                        flex: 1,
                        minWidth: 0,
                    }}
                    className="timeline-scroll"
                >
                    <Timeline style={{ width: '100%' }} items={dayRoutineItems} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        flex: '0 0 325px',
                        minWidth: 0,
                    }}
                >
                    <Select placeholder="Select Routine Stage" options={workoutStageOptions} style={{ width: 325 }} />
                    <Select placeholder="Select Exercise" style={{ width: 325 }} />
                    <div
                        className="inputGrid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 25,
                        }}
                    >
                        <Input placeholder="Sets" style={{ width: 150 }} />
                        <Input placeholder="Reps" style={{ width: 150 }} />
                        <Input placeholder="Weight" style={{ width: 150 }} />
                        <Input placeholder="Duration" style={{ width: 150 }} />
                        <Input placeholder="Distance" style={{ width: 150 }} />
                        <Input placeholder="Rest Time" style={{ width: 150 }} />
                        <Input placeholder="Pace" style={{ width: 150 }} />
                        <Input placeholder="Target RPE" style={{ width: 150 }} />
                    </div>
                    <div
                        className="workoutEditorButtonGroups"
                        style={{
                            display: 'flex',
                            gap: '1rem',
                        }}
                    >
                        <Button type="primary" style={{ width: '100%' }}>
                            Add
                        </Button>
                    </div>
                </div>
                {/* Custom scrollbar styles for timeline-scroll */}
                <style>{`
                    .timeline-scroll::-webkit-scrollbar {
                        width: 8px;
                    }
                    .timeline-scroll::-webkit-scrollbar-thumb {
                        background: #b0b0b0;
                        border-radius: 4px;
                    }
                    .timeline-scroll::-webkit-scrollbar-track {
                        background: #f0f0f0;
                    }
                `}</style>
            </div>
        </>}
        </>
    )
}