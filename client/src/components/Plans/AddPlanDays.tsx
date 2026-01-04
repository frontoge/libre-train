import { Button, Input, Select, Steps } from "antd";
import React, { useContext } from "react";
import "../../styles/index.css";
import { AppContext } from "../../app-context";
import { NewPlanContext } from "../../contexts/NewPlanContext";
import type { RoutineExercise } from "../../../../shared/types";
import { WorkoutRoutine } from "./WorkoutRoutine";

type ExerciseInput = {
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    restTime?: number;
    pace?: string;
    targetRPE?: number;
}

export default function AddPlanDays() {
    const [selectedDay, setSelectedDay] = React.useState(0);
    const [selectedExercise, setSelectedExercise] = React.useState<string | undefined>(undefined);
    const [selectedStage, setSelectedStage] = React.useState<string | undefined>(undefined);
    const [exerciseInput, setExerciseInput] = React.useState<ExerciseInput>({
        sets: undefined,
        reps: undefined,
        weight: undefined,
        duration: undefined,
        distance: undefined,
        restTime: undefined,
        pace: undefined,
        targetRPE: undefined
    });

    const { state: {workoutRoutineStages, exerciseData} } = React.useContext(AppContext);
    const { state: {workoutRoutines}, updateState } = useContext(NewPlanContext);

    const selectedRoutine = workoutRoutines[selectedDay];

    const exerciseKeys: { [key: string]: string } = {};
    exerciseData?.map(exercise => {
        exerciseKeys[exercise.name.replace(/\s+/g, '')] = exercise.key;
    })

    const handleNewDay = () => {
        const newDay = {
            dayName: `Day ${workoutRoutines.length + 1}`,
            exercises: [],

        };
        const newWorkoutRoutines = [
            ...workoutRoutines.slice(0, selectedDay + 1),
            newDay,
            ...workoutRoutines.slice(selectedDay + 1)
        ];
        updateState({ workoutRoutines: newWorkoutRoutines });
        if (newWorkoutRoutines.length !== 1) {
            setSelectedDay(selectedDay + 1);
        }
    }

    const handleDeleteDay = () => {
        if (workoutRoutines.length === 0) return;
        const newWorkoutRoutines = [
            ...workoutRoutines.slice(0, selectedDay),
            ...workoutRoutines.slice(selectedDay + 1)
        ];
        updateState({ workoutRoutines: newWorkoutRoutines });
        setSelectedDay(prev => prev === 0 ? 0 : prev - 1);
    }

    const onSelectDay = (index: number) => {
        setSelectedDay(index);
    }

    const handleStageSelect = (value: string) => {
        setSelectedStage(value);
    }

    const handleExerciseSelect = (value: string) => {
        setSelectedExercise(value);
    }

    const handleExerciseInput = (field: string, value: string) => {

        if (field === 'pace') {
            console.log('setting pace', value);
            setExerciseInput(prev => ({
                ...prev,
                [field]: value ? value : undefined
            }))
            return;
        }

        setExerciseInput(prev => ({
            ...prev,
            [field]: value ? parseFloat(value) : undefined
        }));
    }

    const handleNewExercise = () => {
        if (selectedDay < 0 
            || selectedDay >= workoutRoutines.length
            || !selectedExercise 
            || !selectedStage
        ) return;

        const newExercise: RoutineExercise = {
            ...exerciseInput,
            stage_index: selectedRoutine.exercises.filter(exercise => exercise.routineStage == parseInt(selectedStage)).length,
            routineStage: parseInt(selectedStage), // Use selected stage
            exerciseId: parseInt(exerciseKeys[selectedExercise]) // Use selected exercise
        };
        const updatedWorkoutRoutines = workoutRoutines;

        updatedWorkoutRoutines[selectedDay].exercises.push(newExercise);
        updateState({
            workoutRoutines: updatedWorkoutRoutines
        })
    }

    const handleDeleteExercise = (routineStage: number, stageIndex: number) => {
        const updatedWorkoutRoutines = workoutRoutines;
        const exercises = updatedWorkoutRoutines[selectedDay].exercises;
        const exerciseIndex = exercises.findIndex(ex => ex.routineStage === routineStage && ex.stage_index === stageIndex);
        if (exerciseIndex !== -1) {
            exercises.splice(exerciseIndex, 1);
            // Recalculate stage_index for remaining exercises in the same routineStage
            updatedWorkoutRoutines[selectedDay].exercises
                .filter(ex => ex.routineStage === routineStage)
                .forEach((ex, idx) => {
                    ex.stage_index = idx;
                });
            updateState({
                workoutRoutines: updatedWorkoutRoutines
            });
        }
    }

    const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedWorkoutRoutines = workoutRoutines;
        updatedWorkoutRoutines[selectedDay].dayName = e.target.value;
        updateState({
            workoutRoutines: updatedWorkoutRoutines
        })
    }

    const workoutStageOptions = workoutRoutineStages.map(stage => ({
        label: stage.stage_name,
        value: stage.id
    }));

    
    

    const exerciseOptions = exerciseData?.map(exercise => ({
        label: exercise.name,
        value: exercise.name.replace(/\s+/g, ''),
    }))

    const dayOptions = workoutRoutines.map((dayRoutine) => ({
        title: dayRoutine.dayName,
    }))


    return (
        <>   
            <h1 style={{
                alignSelf: 'start'
            }}>Plan Workouts</h1>
            <Steps size="small" current={selectedDay} onChange={onSelectDay} items={dayOptions}/>
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
            {workoutRoutines.length > 0 && <><Input placeholder="Day Name" style={{ width: 300 }} onChange={handleNameInput} value={workoutRoutines[selectedDay]?.dayName ?? ""} />
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
                <WorkoutRoutine selectedRoutine={selectedRoutine} editable={true} onDelete={handleDeleteExercise} />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        flex: '0 0 325px',
                        minWidth: 0,
                    }}
                >
                    <Select placeholder="Select Routine Stage" options={workoutStageOptions} onChange={handleStageSelect} style={{ width: 325 }} />
                    <Select placeholder="Select Exercise" showSearch style={{ width: 325 }} options={exerciseOptions} onChange={handleExerciseSelect} />
                    <div
                        className="inputGrid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 25,
                        }}
                    >
                        <Input placeholder="Sets" style={{ width: 150 }} onChange={(e) => handleExerciseInput('sets', e.target.value)} />
                        <Input placeholder="Reps" style={{ width: 150 }} onChange={(e) => handleExerciseInput('reps', e.target.value)} />
                        <Input placeholder="Weight" style={{ width: 150 }} onChange={(e) => handleExerciseInput('weight', e.target.value)} />
                        <Input placeholder="Duration" style={{ width: 150 }} onChange={(e) => handleExerciseInput('duration', e.target.value)} />
                        <Input placeholder="Distance" style={{ width: 150 }} onChange={(e) => handleExerciseInput('distance', e.target.value)} />
                        <Input placeholder="Rest Time" style={{ width: 150 }} onChange={(e) => handleExerciseInput('restTime', e.target.value)} />
                        <Input placeholder="Pace" style={{ width: 150 }} onChange={(e) => handleExerciseInput('pace', e.target.value)} />
                        <Input placeholder="Target RPE" style={{ width: 150 }} onChange={(e) => handleExerciseInput('targetRPE', e.target.value)} />
                    </div>
                    <div
                        className="workoutEditorButtonGroups"
                        style={{
                            display: 'flex',
                            gap: '1rem',
                        }}
                    >
                        <Button type="primary" style={{ width: '100%' }} onClick={handleNewExercise}>
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