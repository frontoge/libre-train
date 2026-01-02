CREATE PROCEDURE spCreateWorkoutProgram(
    IN p_plan_id INT
)
BEGIN
	INSERT INTO WorkoutProgram (
		plan_id,
		is_active
	) VALUES (
		p_plan_id,
        1
	);
	SELECT LAST_INSERT_ID() AS workout_program_id;
END
