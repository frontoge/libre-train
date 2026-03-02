CREATE PROCEDURE spCreateWorkoutRoutine(
    IN p_microcycle_id INT,
	IN p_routine_index INT,
	IN p_routine_name VARCHAR(255),
	IN p_isActive BOOLEAN
)
BEGIN
	DECLARE INSERTED_ID INT;

	INSERT INTO WorkoutRoutine (microcycle_id, routine_index, routine_name, isActive)
	VALUES (p_microcycle_id, p_routine_index, p_routine_name, p_isActive);

	SELECT LAST_INSERT_ID() INTO INSERTED_ID;

		IF p_isActive THEN
			IF EXISTS (
				SELECT 1 FROM WorkoutRoutine
				WHERE microcycle_id = p_microcycle_id
				AND routine_index = p_routine_index
				AND id != INSERTED_ID
			) THEN
				UPDATE WorkoutRoutine
				SET routine_index = routine_index + 1
				WHERE microcycle_id = p_microcycle_id
				AND routine_index >= p_routine_index
				AND id != INSERTED_ID
				AND isActive = TRUE;
			END IF;
		END IF;

	SELECT INSERTED_ID as workout_routine_id;
END

