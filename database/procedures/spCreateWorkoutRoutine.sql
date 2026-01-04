CREATE PROCEDURE spCreateWorkoutRoutine(
    IN p_workout_program_id INT,
    IN p_workout_day INT,
	IN p_routine_name VARCHAR(255)
)
BEGIN
	INSERT INTO WorkoutRoutine (
		workout_program_id,
		routine_day,
		routine_name
	) VALUES (
		p_workout_program_id,
        p_workout_day,
		p_routine_name
	);
	SELECT LAST_INSERT_ID() AS workout_routine_id;
END

