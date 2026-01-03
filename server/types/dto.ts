
export type ClientPlanDTO = {
    id: number;
    plan_label: string;
    parent_plan_id?: number;
    plan_phase: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    target_metric_id: number;
    target_value: number;
    created_at: string;
}

export type ClientPlanExerciseDTO = {
    planId: number;
    routine_day: number;
    routine_name?: string;
    exercise_id: number;
    number_reps?: number;
    number_sets?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    rest_time?: number;
    pace?: number;
    rpe?: number;
    routine_stage: number;
    stage_index: number;
}

export type ClientPlanWithExercisesDTO = ClientPlanDTO & {
    exercises: ClientPlanExerciseDTO[];
}