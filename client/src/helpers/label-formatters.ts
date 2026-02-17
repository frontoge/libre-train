import { ExerciseForm, ExerciseMovementPattern, MuscleGroup } from "../../../shared/models";

export const formatClientFullName = (firstName?: string, lastName?: string) => {
    return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

export const MuscleGroupLabels: Record<MuscleGroup, string> = {
    [MuscleGroup.Chest]: "Chest",
    [MuscleGroup.Back]: "Back",
    [MuscleGroup.Shoulders]: "Shoulders",
    [MuscleGroup.Biceps]: "Biceps",
    [MuscleGroup.Triceps]: "Triceps",
    [MuscleGroup.Forearms]: "Forearms",
    [MuscleGroup.Abs]: "Abs",
    [MuscleGroup.Obliques]: "Obliques",
    [MuscleGroup.Quadriceps]: "Quadriceps",
    [MuscleGroup.Hamstrings]: "Hamstrings",
    [MuscleGroup.Glutes]: "Glutes",
    [MuscleGroup.Calves]: "Calves",
    [MuscleGroup.UpperBack]: "Traps",
    [MuscleGroup.Lats]: "Lats",
    [MuscleGroup.LowerBack]: "Lower Back",
    [MuscleGroup.FrontDelts]: "Front Delts",
    [MuscleGroup.LateralDelts]: "Lateral Delts",
    [MuscleGroup.RearDelts]: "Rear Delts",
    [MuscleGroup.Adductors]: "Adductors",
    [MuscleGroup.Abductors]: "Abductors",
    [MuscleGroup.HipFlexors]: "Hip Flexors",
    [MuscleGroup.Neck]: "Neck",
    [MuscleGroup.RotatorCuff]: "Rotator Cuff",
    [MuscleGroup.SerratusAnterior]: "Serratus Anterior",
    [MuscleGroup.Brachialis]: "Brachialis",
    [MuscleGroup.DeepCore]: "Deep Core",
};

export const muscleGroupColors: Record<MuscleGroup, string> = {
    [MuscleGroup.Chest]: "green",
    [MuscleGroup.Back]: "blue",
    [MuscleGroup.Shoulders]: "orange",
    [MuscleGroup.Biceps]: "purple",
    [MuscleGroup.Triceps]: "purple",
    [MuscleGroup.Forearms]: "purple",
    [MuscleGroup.Abs]: "yellow",
    [MuscleGroup.Obliques]: "yellow",
    [MuscleGroup.Quadriceps]: "red",
    [MuscleGroup.Hamstrings]: "red",
    [MuscleGroup.Glutes]: "red",
    [MuscleGroup.Calves]: "red",
    [MuscleGroup.UpperBack]: "blue",
    [MuscleGroup.Lats]: "blue",
    [MuscleGroup.LowerBack]: "blue",
    [MuscleGroup.FrontDelts]: "orange",
    [MuscleGroup.LateralDelts]: "orange",
    [MuscleGroup.RearDelts]: "orange",
    [MuscleGroup.Adductors]: "yellow",
    [MuscleGroup.Abductors]: "yellow",
    [MuscleGroup.HipFlexors]: "yellow",
    [MuscleGroup.Neck]: "pink",
    [MuscleGroup.RotatorCuff]: "orange",
    [MuscleGroup.SerratusAnterior]: "green",
    [MuscleGroup.Brachialis]: "purple",
    [MuscleGroup.DeepCore]: "yellow",
}

export const MovementPatternLabels: Record<ExerciseMovementPattern, string> = {
    [ExerciseMovementPattern.Squat]: "Squat",
    [ExerciseMovementPattern.HipHinge]: "Hip Hinge",
    [ExerciseMovementPattern.Push]: "Push",
    [ExerciseMovementPattern.Pull]: "Pull",
    [ExerciseMovementPattern.VerticalPress]: "Vertical Press"
}

export const ExerciseTypeLabels: Record<ExerciseForm, string> = {
    [ExerciseForm.Flexibility]: "Flexibility",
    [ExerciseForm.Cardio]: "Cardio",
    [ExerciseForm.Core]: "Core",
    [ExerciseForm.Balance]: "Balance",
    [ExerciseForm.Plyometric]: "Plyometric",
    [ExerciseForm.SAQ]: "SAQ",
    [ExerciseForm.Resistance]: "Resistance",
}