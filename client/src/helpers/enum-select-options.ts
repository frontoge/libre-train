import { AssessmentGroup, ExerciseForm, ExerciseMovementPattern, MuscleGroup } from "../../../shared/models";
import { MuscleGroupLabels } from "./label-formatters";

export const assessmentGroupOptions = [
    { label: "Posture Assessment", value: AssessmentGroup.Posture},
    { label: "Composition Assessment", value: AssessmentGroup.Composition},
    { label: "Performance Assessment", value: AssessmentGroup.Performance},
]

export const exerciseFormOptions = [
    { label: "Flexibility", value: ExerciseForm.Flexibility },
    { label: "Cardio", value: ExerciseForm.Cardio },
    { label: "Core", value: ExerciseForm.Core },
    { label: "Balance", value: ExerciseForm.Balance },
    { label: "Plyometric", value: ExerciseForm.Plyometric },
    { label: "SAQ", value: ExerciseForm.SAQ },
    { label: "Resistance", value: ExerciseForm.Resistance },
]

export const exerciseMovementPatternOptions = [
    { label: "Squat", value: ExerciseMovementPattern.Squat },
    { label: "Hip Hinge", value: ExerciseMovementPattern.HipHinge },
    { label: "Push", value: ExerciseMovementPattern.Push },
    { label: "Pull", value: ExerciseMovementPattern.Pull },
    { label: "Vertical Press", value: ExerciseMovementPattern.VerticalPress }
]

export const muscleGroupOptions = Object.entries(MuscleGroupLabels).map(([value, label]) => ({
    label,
    value: Number(value) as MuscleGroup
}));
