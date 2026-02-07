import { Button } from "antd";
import type { RoutineExercise } from "../../../../shared/types";
import { AppContext } from "../../app-context";
import React from "react";

export type PlanExerciseProps = {
    exercise: RoutineExercise
    editable?: boolean;
    onDelete?: () => void;
    onEdit?: () => void;
}

export default function PlanExercise(props: PlanExerciseProps) {
    const { state: {exerciseData} } = React.useContext(AppContext);
    const exercise = exerciseData?.find(ex => parseInt(ex.key) === props.exercise.exerciseId);

    const variableStrings: string[] = [];

    const volumeParts = [
        props.exercise.sets ? `${props.exercise.sets}x` : "",
        props.exercise.reps ?? "",
        props.exercise.duration ? `${props.exercise.duration}s` : ""
    ].filter(Boolean).join("");

    if (volumeParts) variableStrings.push(volumeParts);

    const intensityParts = [
        props.exercise.weight ? `${props.exercise.weight}lbs` : "",
        props.exercise.distance ? `${props.exercise.distance}m` : "",
        props.exercise.targetRPE ? `RPE ${props.exercise.targetRPE}` : ""
    ].filter(Boolean).join("");

    if (intensityParts) variableStrings.push(intensityParts);

    if (props.exercise.pace) variableStrings.push(`${props.exercise.pace} pace`);
    if (props.exercise.restTime) variableStrings.push(`Rest ${props.exercise.restTime}s`);

    const displayString = `${exercise ? exercise.name : "Unknown Exercise"}${variableStrings.length ? " - " : ""}${variableStrings.join(", ")}`;

    return (
        <div>
            <span>{displayString}</span>
            { props.editable &&
            <>
                <Button type="link" onClick={props.onEdit}>Edit</Button>
                <Button color="danger" variant="filled" onClick={props.onDelete}>Remove</Button>
            </>
            }
        </div>
    )
}