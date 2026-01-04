import { Button } from "antd";
import type { RoutineExercise } from "../../../../shared/types";
import { AppContext } from "../../app-context";
import React from "react";

export type PlanExerciseProps = {
    exercise: RoutineExercise
    editable?: boolean;
}

export default function PlanExercise(props: PlanExerciseProps) {
    const { state: {exerciseData} } = React.useContext(AppContext);
    const exercise = exerciseData?.find(ex => parseInt(ex.key) === props.exercise.exerciseId);

    const variableStrings: string[] = [];

    let volumeVariables = props.exercise.sets ? props.exercise.sets + "x" : "";
    volumeVariables += props.exercise.reps ? props.exercise.reps : "";
    volumeVariables += props.exercise.duration ? props.exercise.duration + "s" : "";

    if (volumeVariables.length > 0) {
        variableStrings.push(volumeVariables);
    }

    let intensityVariables = props.exercise.weight ? props.exercise.weight + "lbs" : "";
    intensityVariables += props.exercise.distance ? props.exercise.distance + "m" : "";
    intensityVariables += props.exercise.targetRPE ? "RPE " + props.exercise.targetRPE : "";

    if (intensityVariables.length > 0) {
        variableStrings.push(intensityVariables);
    }

    if (props.exercise.pace) {
        variableStrings.push(props.exercise.pace + " pace");
    }

    if (props.exercise.restTime) {
        variableStrings.push("Rest " + props.exercise.restTime + "s");
    }

    let displayString = (exercise ? exercise.name : "Unknown Exercise") + (variableStrings.length === 0 ? "" : " - ");
    displayString += variableStrings.join(", ");

    return (
        <div>
            <span>{displayString}</span>
            { props.editable &&
            <>
                <Button type="link">Edit</Button>
                <Button type="link" danger>Remove</Button>
            </>
            }
        </div>
    )
}