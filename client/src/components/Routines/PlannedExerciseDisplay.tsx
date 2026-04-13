import type { PlannedExercise } from '@libre-train/shared';
import { useContext, useMemo } from 'react';
import { AppContext } from '../../app-context';
import { secondsToTimeString } from '../../helpers/date-helpers';

export interface PlannedExerciseProps {
	exercise: PlannedExercise;
	restAfter?: number;
}

export function PlannedExerciseDisplay(props: PlannedExerciseProps) {
	const plannedExercise = props.exercise;
	const {
		state: { exerciseData },
	} = useContext(AppContext);

	const exerciseInfo = useMemo(() => {
		return exerciseData?.find((ex) => ex.id === plannedExercise.exercise_id);
	}, [props.exercise, exerciseData]);

	const variableStrings: string[] = [];

	const volumeParts = [
		plannedExercise.exercise_sets ? `${plannedExercise.exercise_sets}x` : '',
		plannedExercise.repetitions ?? '',
		plannedExercise.exercise_duration
			? secondsToTimeString(plannedExercise.exercise_duration) + (plannedExercise.exercise_duration < 60 ? 's' : '')
			: '',
		plannedExercise.exercise_distance ? `${plannedExercise.exercise_distance}m` : '',
		plannedExercise.target_calories ? `${plannedExercise.target_calories}kcal` : '',
		plannedExercise.target_mets ? `${plannedExercise.target_mets}METs` : '',
	]
		.filter(Boolean)
		.join('');

	if (volumeParts) variableStrings.push(volumeParts);

	const intensityParts = [
		plannedExercise.exercise_weight ? `${plannedExercise.exercise_weight}lbs` : '',
		plannedExercise.rpe ? `RPE ${plannedExercise.rpe}` : '',
		plannedExercise.target_heart_rate ? `${plannedExercise.target_heart_rate}bpm` : '',
	]
		.filter(Boolean)
		.join('');

	if (intensityParts) variableStrings.push(intensityParts);

	if (plannedExercise.pace) variableStrings.push(`${plannedExercise.pace} pace`);

	if (props.restAfter) variableStrings.push(`Rest ${props.restAfter}s`);

	const displayString = `${exerciseInfo ? exerciseInfo.exercise_name : 'Unknown Exercise'}${variableStrings.length ? ' - ' : ''}${variableStrings.join(', ')}`;

	return <div>{displayString}</div>;
}
