export enum FrontendRoute {
	Dashboard = '/dashboard',
	Login = '/login',
	Signup = '/signup',
	Logout = '/logout',
	NotFound = '/404',

	Clients = '/clients',
	ClientCreate = '/clients/create',

	Assessments = '/assessments',
	AssessmentCreate = '/assessments/create',

	Training = '/training',
	TrainingCreate = '/training/create',
	TrainingView = '/training/view',

	Exercises = '/exercises',
	ExerciseCreate = '/exercises/create',

	Diet = '/diet',
	DietCreate = '/diet/create',
}

export function buildClientDashboardPath(clientId: string | number): string {
	return `/clients/${clientId}`;
}

export function buildAssessmentPath(assessmentId: string | number): string {
	return `/assessments/${assessmentId}`;
}

export function buildTrainingPlanPath(planId: string | number): string {
	return `/training/${planId}`;
}

export function buildExercisePath(exerciseId: string | number): string {
	return `/exercises/${exerciseId}`;
}

export function buildDietPlanPath(planId: string | number): string {
	return `/diet/${planId}`;
}
