import { useContext, useState } from "react";
import type { PlannedExercise, PlannedExerciseGroup, WorkoutRoutine } from "../../../../../shared/models";
import PageLayout from "../../../components/PageLayout";
import { Panel } from "../../../components/Panel";
import { WorkoutRoutineDisplay } from "../../../components/Routines/WorkoutRoutineDisplay";
import { RoutineExerciseCreateEditForm, type RoutineExerciseCreateEditFormValues } from "../../../components/Routines/RoutineExerciseCreateEditForm";
import { WorkoutNodeType, type WorkoutRoutineGroupNode, type WorkoutRoutineTreeNode } from "../../../types/types";
import { AppContext } from "../../../app-context";
import { timeStringToSeconds } from "../../../helpers/date-helpers";
import { getExerciseFormValuesFromNode, getGroupFormValuesFromNode } from "../../../helpers/routine-helpers";
import { RoutineGroupEditForm, type RoutineGroupEditFormValues } from "../../../components/Routines/RoutineGroupEditForm";


export function RoutineEditor(props: any) {
    const {state: {exerciseData}} = useContext(AppContext);
    const [routine, setRoutine] = useState<WorkoutRoutine>({
        "id": 22,
        "microcycle_id": 8,
        "routine_index": 1,
        "routine_name": "Legs",
        "isActive": true,
        "exercise_groups": [
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 1,
                "exercises": [
                    {
                        "exercise_id": 2,
                        "exerciseName": "Bench Press",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 185
                    }
                ]
            },
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 2,
                "exercises": [
                    {
                        "exercise_id": 2,
                        "exerciseName": "Bench Press",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 135
                    },
                    {
                        "exercise_id": 34,
                        "exerciseName": "Triceps Rope pushdown",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 55
                    }
                ]
            },
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 4,
                "exercises": [
                    {
                        "exercise_id": 2,
                        "exerciseName": "Bench Press",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 135
                    },
                    {
                        "exercise_id": 34,
                        "exerciseName": "Triceps Rope pushdown",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 55
                    }
                ]
            },
            {
                "rest_after": 60,
                "rest_between": 0,
                "routine_category": 4,
                "exercises": [
                    {
                        "exercise_id": 3,
                        "exerciseName": "Lat Pulldown",
                        "repetitions": 10,
                        "sets": 3,
                        "weight": 135
                    }
                ]
            }
        ]
    });
    const [selectedNode, setSelectedNode] = useState<WorkoutRoutineTreeNode | undefined>(undefined);

    const handleEditRoutine = (updatedGroups: PlannedExerciseGroup[]) => {
        setRoutine(prev => ({
            ...prev,
            exercise_groups: updatedGroups
        }))
    }



    const handleExerciseSubmit = (values: RoutineExerciseCreateEditFormValues) => {
        console.log("submitted exercise form", values);
        if (selectedNode === undefined) {
            // Adding new exercise
            const newExercise: PlannedExercise = {
                exercise_id: values.exercise_id,
                exerciseName: exerciseData?.find(ex => ex.id === values.exercise_id)?.exercise_name || "",
                repetitions: values.repetitions,
                sets: values.sets,
                weight: values.weight,
                duration: values.duration ? timeStringToSeconds(values.duration) : undefined,
                distance: values.distance,
                target_heart_rate: values.target_heart_rate,
                pace: values.pace,
                rpe: values.rpe,
                target_calories: values.target_calories,
                target_mets: values.target_mets,
            }

            const newGroup: PlannedExerciseGroup = {
                routine_category: values.category,
                rest_after: values.rest_after,
                exercises: [newExercise]
            }

            setRoutine(prev => ({
                ...prev,
                exercise_groups: [...prev.exercise_groups, newGroup].sort((a, b) => a.routine_category - b.routine_category)
            }))
        } else {
            // Editing existing exercise
            if (selectedNode.nodeType === WorkoutNodeType.Exercise) {
                const nodePos = selectedNode.key.toString().split("-").map(Number);
                const nodeDepth = nodePos.length;
                const updatedExercise: PlannedExercise = {
                    exercise_id: values.exercise_id,
                    exerciseName: exerciseData?.find(ex => ex.id === values.exercise_id)?.exercise_name || "",
                    repetitions: values.repetitions,
                    sets: values.sets,
                    weight: values.weight,
                    duration: values.duration ? timeStringToSeconds(values.duration) : undefined,
                    distance: values.distance,
                    target_heart_rate: values.target_heart_rate,
                    pace: values.pace,
                    rpe: values.rpe,
                    target_calories: values.target_calories,
                    target_mets: values.target_mets,
                }

                setRoutine(prev => {
                    const updatedRoutine = {...prev};
                    const existingGroup = updatedRoutine.exercise_groups.filter((group) => group.routine_category === nodePos[0] + 1)[nodePos[1]];
                    existingGroup.rest_after = values?.rest_after ?? existingGroup.rest_after;
                    existingGroup.exercises = nodeDepth !== 3
                        ? [updatedExercise] 
                        : existingGroup.exercises.map((exercise, index) => {
                            if (index === nodePos[2]) {
                                return updatedExercise;
                            }
                            return exercise;
                        })
                    return updatedRoutine;
                })
            }
        }
    }

    const handleGroupSubmit = (values: RoutineGroupEditFormValues) => {
        if (!selectedNode) return;
        setRoutine(prev => {
            const updatedRoutine = {...prev};
            const nodePos = selectedNode.key.toString().split("-").map(Number);
            const existingGroup = updatedRoutine.exercise_groups.filter((group) => group.routine_category === nodePos[0] + 1)[nodePos[1]];
            existingGroup.rest_after = values?.rest_after ?? existingGroup.rest_after;
            existingGroup.rest_between = values?.rest_between ?? existingGroup.rest_between;
            return updatedRoutine;
        })
    }

    const handleRoutineRename = (newName: string) => {
        setRoutine(prev => ({
            ...prev,
            routine_name: newName
        }))
    }

    return (
        <PageLayout 
            title="Routine Editor" 
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '2rem',
                gap: '2rem'
            }}
        >
            <Panel  
                style={{
                    width: '100%',
                    height: "100%",
                    display: 'flex',
                    gap: '2rem'
                }}
            >
                <WorkoutRoutineDisplay 
                    routine={routine} 
                    isEdit={true}
                    onEdit={handleEditRoutine}
                    style={{
                        width: "35%",
                        height: "100%",
                    }}
                    onRename={handleRoutineRename}
                    onSelectNode={setSelectedNode}
                />
                { (selectedNode === undefined || selectedNode.nodeType === WorkoutNodeType.Exercise) ?
                <RoutineExerciseCreateEditForm 
                    style={{
                        width: "50%",
                        height: "100%",
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                    onSubmitForm={handleExerciseSubmit}
                    initialValues={selectedNode !== undefined ? getExerciseFormValuesFromNode(selectedNode) : undefined}
                />
                : (selectedNode !== undefined) &&
                    <RoutineGroupEditForm
                        style={{
                            width: "50%",
                            height: "100%",
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}
                        initialValues={getGroupFormValuesFromNode(selectedNode as WorkoutRoutineGroupNode)}
                        onSubmitForm={handleGroupSubmit}
                    />
                }
            </Panel>
            
        </PageLayout>
    )
}