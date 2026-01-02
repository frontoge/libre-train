import { Button } from "antd";
import type { RoutineExercise } from "../../contexts/NewPlanContext";
import { AppContext } from "../../app-context";
import React from "react";

export type PlanExerciseProps = {
    exercise: RoutineExercise
}

export default function PlanExercise(props: PlanExerciseProps) {
    const { state: {exerciseData} } = React.useContext(AppContext);
    const exercise = exerciseData?.find(ex => parseInt(ex.key) === props.exercise.exerciseId);

    let displayString = (exercise ? exercise.name : "Unknown Exercise") + " - ";
    displayString += (props.exercise.reps ? props.exercise.reps + "x" : "");
    displayString += (props.exercise.sets ? props.exercise.sets : "");
    displayString += (props.exercise.weight ? ", " + props.exercise.weight + "kg" : "");
    displayString += (props.exercise.duration ? ", " + props.exercise.duration + "min" : "");
    displayString += (props.exercise.distance ? ", " + props.exercise.distance + "m" : "");
    displayString += (props.exercise.targetRPE ? ", RPE " + props.exercise.targetRPE : "");
    displayString += (props.exercise.pace ? ", " + props.exercise.pace + " pace" : "");
    displayString += (props.exercise.restTime ? ", Rest " + props.exercise.restTime + "s" : "");

    return (
        <div>
            <span>{displayString}</span>
            <Button type="link">Edit</Button>
            <Button type="link" danger>Remove</Button>
        </div>
    )
}