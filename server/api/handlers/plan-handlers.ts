import { Request, Response } from "express"; 
import { SubmitPlanRequest } from "../../../shared/types";
import { getDatabaseConnection } from "../../infrastructure/mysql-database";

export async function handleCreatePlan(req: Request<{}, {}, SubmitPlanRequest>, res: Response) {
    const body = req.body;

    if (!validatePlanCreateRequest(body)) {
        res.status(400).json({ message: "Invalid plan creation request" });
        return;
    }

    const connection = await getDatabaseConnection();

    try {
        // Step 1: Create plan in plans table
        console.log("Creating plan");
        const [results] = await connection.query(`CALL spCreatePlan(?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            body.clientId,
            body.planLabel,
            body.parentPlanId || null,
            body.plan_phase,
            body.dates[0],
            body.dates[1],
            true,
            body.targetMetricId,
            body.targetMetricValue
        ]);

        const planId = (results as any)[0][0].plan_id;
        // Step 2: Create WorkoutProgram entry
        console.log("Creating workout program for plan:", planId);
        const [WorkoutProgramResults] = await connection.query(`CALL spCreateWorkoutProgram(?)`, [
            planId
        ])

        const workoutProgramId = (WorkoutProgramResults as any)[0][0].workout_program_id;
        // Step 3: Create WorkoutRoutine entries
        console.log("Creating workout routines for workout program:", workoutProgramId);
        body.workoutRoutines.map(async (routine, index) => {
            const [WorkoutRoutineResults] = await connection.query(`CALL spCreateWorkoutRoutine(?, ?)`, [
                workoutProgramId,
                index
            ])

            // Step 4: Create WorkoutRoutineExercise entrie
            const workoutRoutineId = (WorkoutRoutineResults as any)[0][0].workout_routine_id;
            console.log("Creating exercises for workout routine:", workoutRoutineId);
            routine.exercises.map(async (exercise) => {
                await connection.query(`INSERT INTO WorkoutRoutineExercise (
                    routine_id,
                    exercise_id,
                    number_reps,
                    number_sets,
                    weight,
                    duration,
                    distance,
                    rest_time,
                    pace,
                    rpe,
                    routine_stage,
                    stage_index)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    workoutRoutineId,
                    exercise.exerciseId,
                    exercise.reps,
                    exercise.sets,
                    exercise.weight,
                    exercise.duration,
                    exercise.distance,
                    exercise.restTime,
                    exercise.pace,
                    exercise.targetRPE,
                    exercise.routineStage,
                    exercise.stage_index
                ])
            });
        });

        res.status(201).json({ message: "Plan created successfully", planId } );
    }
    catch (error) {
        console.error("Error creating plan:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

function validatePlanCreateRequest(body: SubmitPlanRequest): boolean {
    return !(!body.clientId ||
        !body.plan_phase ||
        !body.dates ||
        body.dates.length !== 2 ||
        !body.targetMetricId ||
        !body.targetMetricValue ||
        !body.workoutRoutines
    );
}