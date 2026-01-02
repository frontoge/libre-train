CREATE PROCEDURE spCreateWorkoutRoutine(
    IN p_workout_program_id INT,
    IN p_workout_day INT
)
BEGIN
	INSERT INTO WorkoutRoutine (
		workout_program_id,
		routine_day,
	) VALUES (
		p_workout_program_id,
        p_workout_day
	);
	SELECT LAST_INSERT_ID() AS workout_routine_id;
END

