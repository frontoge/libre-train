export type Goal = {
    id: number;
    goal: string;
}

export type ResponseWithError<T> = T | {hasError: true; errorMessage: string};

export type AddClientFormValues = {
    information: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        height?: number;
        age?: number;
        img64?: string;
        notes?: string;
    },
    goals: {
        goal?: number;
        targetWeight?: number;
        targetBodyFat?: number;
        targetLeanMass?: number;
        targetDate?: Date;
    },
    measurements: {
        weight?: number;
        body_fat?: number;
        wrist?: number;
        calves?: number;
        biceps?: number;
        chest?: number;
        thighs?: number;
        waist?: number;
        shoulders?: number;
        hips?: number;
        forearm?: number;
        neck?: number;
    },
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