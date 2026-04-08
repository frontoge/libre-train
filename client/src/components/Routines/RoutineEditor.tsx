import type { PlannedExercise, PlannedExerciseGroup } from '@libre-train/shared';
import { useState } from 'react';
import { timeStringToSeconds } from '../../helpers/date-helpers';
import { getExerciseFormValuesFromNode, getGroupFormValuesFromNode } from '../../helpers/routine-helpers';
import {
	WorkoutNodeType,
	type WorkoutRoutineEdit,
	type WorkoutRoutineExerciseNode,
	type WorkoutRoutineGroupNode,
	type WorkoutRoutineTreeNode,
} from '../../types/types';
import { RoutineExerciseCreateEditForm, type RoutineExerciseCreateEditFormValues } from './RoutineExerciseCreateEditForm';
import { RoutineGroupEditForm, type RoutineGroupEditFormValues } from './RoutineGroupEditForm';
import { WorkoutRoutineDisplay } from './WorkoutRoutineDisplay';

export interface RoutineEditorProps extends React.HTMLAttributes<HTMLDivElement> {
	routine: WorkoutRoutineEdit;
	onRoutineChange: (updatedRoutine: WorkoutRoutineEdit) => void;
}

export function RoutineEditor(props: RoutineEditorProps) {
	const { routine: routine, onRoutineChange, ...divProps } = props;
	const [selectedNode, setSelectedNode] = useState<WorkoutRoutineTreeNode | undefined>(undefined);

	const handleEditRoutine = (updatedGroups: PlannedExerciseGroup[]) => {
		onRoutineChange({
			...routine,
			exercise_groups: updatedGroups,
		});
	};

	const handleExerciseSubmit = (values: RoutineExerciseCreateEditFormValues) => {
		if (selectedNode === undefined) {
			// Adding new exercise
			const newExercise: PlannedExercise = {
				id: Date.now(), // Temporary ID, should be replaced with proper ID from backend
				exercise_id: values.exercise_id,
				repetitions: values.repetitions,
				exercise_sets: values.sets,
				exercise_weight: values.weight,
				exercise_duration: values.duration ? timeStringToSeconds(values.duration) : undefined,
				exercise_distance: values.distance,
				target_heart_rate: values.target_heart_rate,
				pace: values.pace,
				rpe: values.rpe,
				target_calories: values.target_calories,
				target_mets: values.target_mets,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			};

			const newGroup: PlannedExerciseGroup = {
				id: Date.now(), // Temporary ID, should be replaced with proper ID from backend
				routine_category: values.category,
				rest_after: values.rest_after,
				exercises: [newExercise],
			};

			onRoutineChange({
				...routine,
				exercise_groups: [...routine.exercise_groups, newGroup].sort((a, b) => a.routine_category - b.routine_category),
			});
		} else {
			// Editing existing exercise
			if (selectedNode.nodeType === WorkoutNodeType.Exercise) {
				const nodePos = selectedNode.key.toString().split('-').map(Number);
				const nodeDepth = nodePos.length;
				const updatedExercise: PlannedExercise = {
					id: Date.now(),
					exercise_id: values.exercise_id,
					repetitions: values.repetitions,
					exercise_sets: values.sets,
					exercise_weight: values.weight,
					exercise_duration: values.duration ? timeStringToSeconds(values.duration) : undefined,
					exercise_distance: values.distance,
					target_heart_rate: values.target_heart_rate,
					pace: values.pace,
					rpe: values.rpe,
					target_calories: values.target_calories,
					target_mets: values.target_mets,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};

				const updatedRoutine = { ...routine };
				const existingGroup = updatedRoutine.exercise_groups.filter((group) => group.routine_category === nodePos[0] + 1)[
					nodePos[1]
				];
				existingGroup.rest_after = values?.rest_after ?? existingGroup.rest_after;
				existingGroup.exercises =
					nodeDepth !== 3
						? [updatedExercise]
						: existingGroup.exercises.map((exercise, index) => {
								if (index === nodePos[2]) {
									return updatedExercise;
								}
								return exercise;
							});
				onRoutineChange(updatedRoutine);
			}
		}
	};

	const handleGroupSubmit = (values: RoutineGroupEditFormValues) => {
		if (!selectedNode) return;

		const updatedRoutine = { ...routine };
		const nodePos = selectedNode.key.toString().split('-').map(Number);
		const existingGroup = updatedRoutine.exercise_groups.filter((group) => group.routine_category === nodePos[0] + 1)[
			nodePos[1]
		];
		existingGroup.rest_after = values?.rest_after ?? existingGroup.rest_after;
		existingGroup.rest_between = values?.rest_between ?? existingGroup.rest_between;
		onRoutineChange(updatedRoutine);
	};

	const handleRoutineRename = (newName: string) => {
		onRoutineChange({
			...routine,
			routine_name: newName,
		});
	};

	return (
		<div
			{...divProps}
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				gap: '2rem',
				...divProps.style,
			}}
		>
			<WorkoutRoutineDisplay
				routine={routine}
				isEdit={true}
				onEdit={handleEditRoutine}
				style={{
					width: '35%',
					height: '100%',
				}}
				onRename={handleRoutineRename}
				onSelectNode={setSelectedNode}
			/>
			{selectedNode === undefined || selectedNode.nodeType === WorkoutNodeType.Exercise ? (
				<RoutineExerciseCreateEditForm
					style={{
						width: '50%',
						height: '100%',
						marginLeft: 'auto',
						marginRight: 'auto',
						paddingRight: '10px',
						overflow: 'auto',
						scrollbarGutter: 'stable',
					}}
					onSubmitForm={handleExerciseSubmit}
					initialValues={
						selectedNode !== undefined
							? getExerciseFormValuesFromNode(selectedNode as WorkoutRoutineExerciseNode)
							: undefined
					}
				/>
			) : (
				selectedNode !== undefined && (
					<RoutineGroupEditForm
						style={{
							width: '50%',
							height: '100%',
							marginLeft: 'auto',
							marginRight: 'auto',
						}}
						initialValues={getGroupFormValuesFromNode(selectedNode as WorkoutRoutineGroupNode)}
						onSubmitForm={handleGroupSubmit}
					/>
				)
			)}
		</div>
	);
}
