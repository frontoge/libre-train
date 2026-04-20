import {
	AssessmentClientLogSchema,
	AssessmentTypeSchema,
	ClientContactSchema,
	ClientDietPlanSchema,
	ClientGoalAssessmentSchema,
	ClientGoalSchema,
	ClientSchema,
	ContactSchema,
	DietPlanLogEntrySchema,
	DietPlanSchema,
	ExerciseSchema,
	MacrocycleSchema,
	MesocycleSchema,
	MicrocycleSchema,
	PlannedExerciseGroupSchema,
	PlannedExerciseSchema,
	WorkoutRoutineSchema,
} from '@libre-train/db/zod';
import z from 'zod';

export type StringifyDates<T> = T extends Date
	? string
	: T extends Array<infer U>
		? Array<StringifyDates<U>>
		: T extends object
			? { [K in keyof T]: StringifyDates<T[K]> }
			: T;

export type NullToUndefined<T> =
	T extends Array<infer U>
		? Array<NullToUndefined<U>>
		: T extends object
			? { [K in keyof T]: NullToUndefined<T[K]> }
			: [Extract<T, null>] extends [never]
				? T
				: Exclude<T, null> | undefined;

export type DataModel<T> = NullToUndefined<StringifyDates<z.infer<T>>>;

export type Contact = DataModel<typeof ContactSchema>;

export type Client = DataModel<typeof ClientSchema>;

export type ClientContact = DataModel<typeof ClientContactSchema>;

export type AssessmentType = DataModel<typeof AssessmentTypeSchema>;

export type AssessmentClientLog = DataModel<typeof AssessmentClientLogSchema>;

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

export type Exercise = Omit<DataModel<typeof ExerciseSchema>, 'muscle_groups'> & {
	muscle_groups: MuscleGroup[];
};

export type Macrocycle = DataModel<typeof MacrocycleSchema>;

export type Mesocycle = Omit<DataModel<typeof MesocycleSchema>, 'opt_levels' | 'cardio_levels'> & {
	opt_levels?: number[] | undefined;
	cardio_levels?: number[] | undefined;
};

export type Microcycle = DataModel<typeof MicrocycleSchema>;

export type PlannedExercise = Omit<
	DataModel<typeof PlannedExerciseSchema>,
	'exercise_group_id' | 'exercise_group_index' | 'exercise_distance'
> & {
	exercise_distance?: number | undefined;
};

export type PlannedExerciseGroup = Omit<DataModel<typeof PlannedExerciseGroupSchema>, 'workout_routine_id' | 'group_index'> & {
	exercises: PlannedExercise[];
};

export type WorkoutRoutine = DataModel<typeof WorkoutRoutineSchema> & {
	exercise_groups: PlannedExerciseGroup[];
};

export enum WorkoutRoutineCategory {
	Warmup = 1,
	Activation = 2,
	SkillDevelopment = 3,
	ResistanceTraining = 4,
	ClientsChoice = 5,
	Cooldown = 6,
}

export type DietPlan = DataModel<typeof DietPlanSchema>;

export type DietPlanLogEntry = DataModel<typeof DietPlanLogEntrySchema>;

export type ClientDietPlan = DataModel<typeof ClientDietPlanSchema>;

export type ClientGoal = DataModel<typeof ClientGoalSchema>;

export type ClientGoalAssessment = DataModel<typeof ClientGoalAssessmentSchema>;

export const GoalStatusValues = ['planned', 'in_progress', 'achieved', 'missed', 'abandoned'] as const;
export type GoalStatus = (typeof GoalStatusValues)[number];

export enum CycleLevel {
	Macrocycle = 'macrocycle',
	Mesocycle = 'mesocycle',
	Microcycle = 'microcycle',
}

export interface ClientDietLogTodo {
	clientId: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	trainerId: number;
	lastLogDate?: string;
}

export interface ClientTrainingPlanTodo {
	clientId: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
	trainerId: number;
}
