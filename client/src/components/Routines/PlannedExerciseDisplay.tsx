import type { PlannedExercise } from '@libre-train/shared';

export interface PlannedExerciseProps {
	exercise: PlannedExercise;
	restAfter?: number;
}

export function PlannedExerciseDisplay(props: PlannedExerciseProps) {
	const plannedExercise = props.exercise;

	const variableStrings: string[] = [];

	const volumeParts = [
		plannedExercise.sets ? `${plannedExercise.sets}x` : '',
		plannedExercise.repetitions ?? '',
		plannedExercise.duration ? `${plannedExercise.duration}s` : '',
		plannedExercise.distance ? `${plannedExercise.distance}m` : '',
		plannedExercise.target_calories ? `${plannedExercise.target_calories}kcal` : '',
		plannedExercise.target_mets ? `${plannedExercise.target_mets}METs` : '',
	]
		.filter(Boolean)
		.join('');

	if (volumeParts) variableStrings.push(volumeParts);

	const intensityParts = [
		plannedExercise.weight ? `${plannedExercise.weight}lbs` : '',
		plannedExercise.rpe ? `RPE ${plannedExercise.rpe}` : '',
		plannedExercise.target_heart_rate ? `${plannedExercise.target_heart_rate}bpm` : '',
	]
		.filter(Boolean)
		.join('');

	if (intensityParts) variableStrings.push(intensityParts);

	if (plannedExercise.pace) variableStrings.push(`${plannedExercise.pace} pace`);

	if (props.restAfter) variableStrings.push(`Rest ${props.restAfter}s`);

	const displayString = `${plannedExercise.exerciseName ? plannedExercise.exerciseName : 'Unknown Exercise'}${variableStrings.length ? ' - ' : ''}${variableStrings.join(', ')}`;

	return <div>{displayString}</div>;
}
