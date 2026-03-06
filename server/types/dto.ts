
export type WorkoutRoutineExerciseDTO = {
    routineId: number;
    microcycle_id: number;
    routine_index: number;
    routine_name?: string;
    isActive: number;
    group_index: number;
    rest_after?: number;
    rest_between?: number;
    routine_category: number;
    exercise_id: number;
    exercise_name?: string;
    exercise_group_index: number;
    repetitions?: number;
    exercise_sets?: number;
    exercise_weight?: number;
    exercise_duration?: number;
    exercise_distance?: number;
    target_heart_rate?: number;
    pace?: string;
    rpe?: number;
    target_calories?: number;
    target_mets?: number;
}