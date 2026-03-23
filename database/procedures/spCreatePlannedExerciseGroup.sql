CREATE PROCEDURE spCreatePlannedExerciseGroup(
    IN p_workout_routine_id INT,
    IN p_group_index INT,
    IN p_rest_between INT,
    IN p_rest_after INT,
    IN p_routine_category INT
)
BEGIN
    DECLARE INSERTED_ID INT;

    INSERT INTO PlannedExerciseGroup (workout_routine_id, group_index, rest_between, rest_after, routine_category)
    VALUES (p_workout_routine_id, p_group_index, p_rest_between, p_rest_after, p_routine_category);

    SELECT LAST_INSERT_ID() INTO INSERTED_ID;

    UPDATE PlannedExerciseGroup
    SET group_index = group_index + 1
    WHERE workout_routine_id = p_workout_routine_id
    AND group_index >= p_group_index
    AND id != INSERTED_ID;

    SELECT INSERTED_ID as planned_exercise_group_id;
END