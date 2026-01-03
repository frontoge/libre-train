import { Plan, WorkoutRoutine } from "../../shared/types";
import { ClientPlanExerciseDTO, ClientPlanWithExercisesDTO } from "../types/dto";

export function mapPlanDTOToPlans(planDTO: ClientPlanWithExercisesDTO): Plan {
    const plan: Plan = {
        id: planDTO.id,
        planName: planDTO.plan_label,
        parentPlanId: planDTO.parent_plan_id,
        planPhase: planDTO.plan_phase,
        startDate: planDTO.start_date,
        endDate: planDTO.end_date,
        isActive: planDTO.is_active,
        targetMetricId: planDTO.target_metric_id,
        targetMetricValue: planDTO.target_value,
        planCreatedAt: planDTO.created_at,
        workoutRoutines: mapPlanExerciseDTOToWorkoutRoutines(planDTO.exercises)
    }
    return plan;
}

export function mapPlanExerciseDTOToWorkoutRoutines(planDTO: ClientPlanExerciseDTO[]): WorkoutRoutine[] {
    // Step 1 build each routine day
    const routines: WorkoutRoutine[] = [];

    planDTO.sort((a, b) => a.routine_day - b.routine_day).map(routine => {
        if (!routines[routine.routine_day]) {
            routines[routine.routine_day] = {
                dayName: routine.routine_name || `Day ${routine.routine_day + 1}`,
                exercises: []
            }
        }
    })

    // Step 2 populate exercise for each day
    planDTO.map(exercise => {
        const routine = routines[exercise.routine_day];
        if (!routine) {
            return;
        }

        routine.exercises.push({
            routineStage: exercise.routine_stage,
            stage_index: exercise.stage_index,
            exerciseId: exercise.exercise_id,
            sets: exercise.number_sets || undefined,
            reps: exercise.number_reps || undefined,
            weight: exercise.weight || undefined,
            duration: exercise.duration || undefined,
            distance: exercise.distance || undefined,
            restTime: exercise.rest_time || undefined,
            pace: exercise.pace || undefined,
            targetRPE: exercise.rpe || undefined
        });
        routines[exercise.routine_day] = routine;
    })

    return routines;
} 