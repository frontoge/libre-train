export type TargetMetric = {
    id: number;
    metric_name: string;
    target_unit: string;
}

export type Contact = {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: string; 
    img?: string;
}

export type Client = {
    id: number;
    height?: number;
    created_at: Date;
    updated_at: Date;
    notes?: string;
}

export type ClientContact = Client & Omit<Contact, "id">;

export type AssessmentType = {
    id: number;
    name: string;
    assessmentUnit: string;
    assessmentGroupId: number;
}

export type AssessmentClientLog = {
    id: number;
    clientId: number;
    assessmentTypeId: number;
    assessmentValue: string;
    assessmentDate: string;
    notes?: string;
}

export enum AssessmentGroup {
    Posture = 1,
    Composition = 2,
    Performance = 3,
}

export enum ExerciseForm {
    Flexibility = 1,
    Cardio = 2,
    Core = 3,
    Balance = 4,
    Plyometric = 5,
    SAQ = 6,
    Resistance = 7,
}

export enum ExerciseMovementPattern {
    Squat = 1,
    HipHinge = 2,
    Push = 3,
    Pull = 4,
    VerticalPress = 5,
}

export enum MuscleGroup {
    Chest = 1,
    Back = 2,
    Shoulders = 3,
    Biceps = 4,
    Triceps = 5,
    Forearms = 6,
    Abs = 7,
    Obliques = 8,
    Quadriceps = 9,
    Hamstrings = 10,
    Glutes = 11,
    Calves = 12,
    UpperBack = 13,
    Lats = 14,
    LowerBack = 15,
    FrontDelts = 16,
    LateralDelts = 17,
    RearDelts = 18,
    Adductors = 19,
    Abductors = 20,
    HipFlexors = 21,
    Neck = 22,
    RotatorCuff = 23,
    SerratusAnterior = 24,
    Brachialis = 25,
    DeepCore = 26,
}

export type Exercise = {
    id: number;
    exercise_name: string;
    muscle_groups: MuscleGroup[];
    video_link?: string;
    exercise_description?: string;
    equipment?: string;
    exercise_form?: ExerciseForm;
    movement_pattern?: ExerciseMovementPattern;
    progression_level: number;
}

export type Macrocycle = {
    id: number;
    cycle_name?: string;
    client_id: number;
    cycle_start_date: Date;
    cycle_end_date: Date;
    isActive: boolean;
    notes?: string;
}

export type Mesocycle = {
    id: number;
    client_id: number;
    cycle_name?: string;
    macrocycle_id: number;
    cycle_start_date: Date;
    cycle_end_date: Date;
    isActive: boolean;
    notes?: string;
    optLevels?: number[];
    cardioLevels?: number[];
}

export type Microcycle = {
    id: number;
    mesocycle_id: number;
    client_id: number;
    cycle_name?: string;
    cycle_start_date: Date;
    cycle_end_date: Date;
    isActive: boolean;
    notes?: string;
}

export interface PlannedExercise {
    exercise_id: number;
    exerciseName?: string;
    repetitions?: number;
    sets?: number;
    weight?: number;
    duration?: number;
    distance?: number;
    target_heart_rate?: number;
    pace?: string;
    rpe?: number;
    target_calories?: number;
    target_mets?: number;
}

export interface PlannedExerciseGroup {
    rest_between?: number;
    rest_after?: number;
    routine_category: number;
    exercises: PlannedExercise[];
}

export interface WorkoutRoutine {
    id: number;
    microcycle_id: number;
    routine_index: number;
    routine_name?: string;
    isActive: boolean;
    exercise_groups: PlannedExerciseGroup[];
}

export enum WorkoutRoutineCategory {
    Warmup = 1,
    Activation = 2,
    SkillDevelopment = 3,
    ResistanceTraining = 4,
    ClientsChoice = 5,
    Cooldown = 6
}

export interface DietPlan {
    id: number;
    planName?: string;
    clientId: number;
    trainerId: number;
    isActive: boolean;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFats?: number;
    notes?: string;
}

export interface DietPlanLogEntry {
    id: number;
    dietPlanId: number;
    clientId: number;
    logDate: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface ClientDietPlan {
    first_name: string;
    last_name: string;
    trainerId: number;
    planName?: string;
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFats?: number;
    notes?: string;
    dietPlanId?: number;
    clientId: number;
}