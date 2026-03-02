CREATE PROCEDURE spDeleteWorkoutRoutine(
    IN p_routine_id INT
)
BEGIN

    DECLARE v_microcycle_id INT;
    DECLARE v_routine_index INT;

    # Get microcycle_id and routine_index for the routine to be deleted
    SELECT microcycle_id, routine_index
        INTO v_microcycle_id, v_routine_index
    FROM WorkoutRoutine
    WHERE id = p_routine_id;

    UPDATE WorkoutRoutine
    SET isActive = false
    WHERE id = p_routine_id;

    UPDATE WorkoutRoutine
    SET routine_index = routine_index - 1
    WHERE microcycle_id = v_microcycle_id
        AND routine_index > v_routine_index
        AND isActive = true;


END;