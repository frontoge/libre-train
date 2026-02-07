CREATE PROCEDURE spGetClientExercises(
    IN p_client_id INT
) 
BEGIN
    SELECT 
        p.id as planId,
        wr.routine_day,
        wr.routine_name,
        wre.exercise_id,
        wre.number_reps,
        wre.number_sets,
        wre.weight,
        wre.duration,
        wre.distance,
        wre.rest_time,
        wre.pace,
        wre.rpe,
        wre.routine_stage,
        wre.stage_index
    FROM Plan p
    left JOIN WorkoutProgram wp
        ON wp.plan_id = p.id
    LEFT JOIN WorkoutRoutine wr
        ON wr.workout_program_id = wp.id
    LEFT JOIN WorkoutRoutineExercise wre
        ON wre.routine_id = wr.id
    WHERE p.client_id = p_client_id;
END