import { Request, Response } from "express"; 
import { SubmitPlanRequest } from "../../../shared/types";
import { closeDatabaseConnection, getDatabaseConnection } from "../../infrastructure/mysql-database";
import { ClientPlanDTO, ClientPlanExerciseDTO, ClientPlanWithExercisesDTO } from "../../types/dto";
import { mapPlanDTOToPlans} from "../../mappers/plan-mappers";

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
            const [WorkoutRoutineResults] = await connection.query(`CALL spCreateWorkoutRoutine(?, ?, ?)`, [
                workoutProgramId,
                index,
                routine.dayName
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

export async function handleGetClientPlans(req: Request, res: Response) {
    const clientId = req.params.id;
    const connection = await getDatabaseConnection();
    
    try {
        const [results] = await connection.query(`CALL spGetClientPlans(?)`, [clientId]);
        const [exerciseResults] = await connection.query(`CALL spGetClientExercises(?)`, [clientId]);
        const plans = (results as any)[0];
        const exercises = (exerciseResults as any)[0];

        const populatedPlans: ClientPlanWithExercisesDTO[] = plans.map((plan: ClientPlanDTO) => {
            const planExercises = exercises.filter((ex: ClientPlanExerciseDTO) => ex.planId === plan.id);
            return {
                ...plan,
                exercises: planExercises
            }
        })

        const mappedPlans = populatedPlans.map((planDTO: ClientPlanWithExercisesDTO) => mapPlanDTOToPlans(planDTO));
        res.status(200).json(mappedPlans);
    } catch (error) {
        console.error("Error fetching client plans:", error);
        res.status(500).json({ message: "Internal server error" });   
    } finally {
        await closeDatabaseConnection(connection);
    }
}

export async function handleDeletePlan(req: Request, res: Response) {
    const planId = req.params.id;
    const connection = await getDatabaseConnection();

    try {
        await connection.query(`CALL spDeletePlan(?)`, [planId]);
        res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error) {
        console.error("Error deleting plan:", error);
        res.status(500).json({ message: "Internal server error" });
    } finally {
        await closeDatabaseConnection(connection);
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