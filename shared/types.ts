import type { AssessmentClientLog } from "./models";

export type Goal = {
    id: number;
    goal: string;
}

export type ResponseWithError<T> = T | {hasError: true; errorMessage: string};

export type AddClientFormValues = {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    height?: number;
    dob?: string;
    img64?: string;
    notes?: string;
    trainerId: number;
}

export type DailyUpdateData = {
    weight?: number;
    body_fat?: number;
    calories?: number;
    target_calories?: number;
    protein?: number;
    target_protein?: number;
    carbs?: number;
    target_carbs?: number;
    fats?: number;
    target_fats?: number;
}

export type DailyUpdateRequest = {
    clientId: number;
    date: string; // ISO string
    data: DailyUpdateData;
}

export type DashboardData = {
    clientId: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    height?: number;
    img?: string;
    logged_weight: number;
    logged_calories?: number;
    logged_body_fat?: number;
    logged_protein?: number;
    logged_carbs?: number;
    logged_fats?: number;
    target_calories?: number;
    target_protein?: number;
    target_carbs?: number;
    target_fats?: number;
    goal?: string;
    goal_weight?: number;
    goal_bodyFat?: number;
}

export type ErrorResponse = {
    message: string;
}

export type DashboardResponse = DashboardData | ErrorResponse;

export type DashboardSummaryQuery = {
    clientId: string;
    startDate: string; 
    endDate: string; 
}

export type DashboardWeeklySummary = {
    avg_weight: number;
    avg_bodyfat: number;
    avg_calories: number;
    total_macros: number;
    target_macros: number;
}

export type DashboardWeeklySummaryResponse = DashboardWeeklySummary[] | ErrorResponse;

export type AddExerciseFormData = {
    name: string;
    muscleGroups: string[];
    description?: string;
    videoLink?: string;
}

export type RoutineExercise = {
    routineStage: number;
    stage_index: number;
    exerciseId: number;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    restTime?: number;
    pace?: string;
    targetRPE?: number;
}

export type WorkoutRoutine = {
    dayName: string;
    exercises: RoutineExercise[];
}

export type SubmitPlanRequest = {
    clientId: number;
    planLabel?: string;
    parentPlanId?: number;
    plan_phase: number;
    dates: [string, string];
    targetMetricId: number;
    targetMetricValue: number;
    workoutRoutines: WorkoutRoutine[]

}

export type Plan = {
    id: number;
    planName: string;
    parentPlanId?: number;
    planPhase: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    targetMetricId: number; 
    targetMetricValue: number;
    planCreatedAt: string;
    workoutRoutines: WorkoutRoutine[];
}

export type AssessmentClientLogCreateRequest = {
    clientId: number;
    assessments: Omit<AssessmentClientLog, "id" | "clientId">[];
}

export type AssessmentClientLogSearchOptions = {
    group?: string;
    type?: string;
    start?: string;
    end?: string;
    page?: number;
    pageSize?: number;
}