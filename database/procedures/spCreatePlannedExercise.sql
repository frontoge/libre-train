CREATE PROCEDURE spCreatePlannedExercise(
    IN p_exercise_id INT,
    IN p_exercise_group_id INT,
    IN p_exercise_group_index INT,
    IN p_repetitions INT,
    IN p_exercise_sets INT,
    IN p_exercise_weight DECIMAL(10, 2),
    IN p_exercise_duration INT,
    IN p_exercise_distance DECIMAL(10, 2),
    IN p_target_heart_rate INT,
    IN p_pace VARCHAR(32),
    IN p_rpe INT,
    IN p_target_calories INT,
    IN p_target_mets INT
)
BEGIN
    DECLARE INSERTED_ID INT;

    INSERT INTO PlannedExercise (
        exercise_id,
        exercise_group_id,
        exercise_group_index,
        repetitions,
        exercise_sets,
        exercise_weight,
        exercise_duration,
        exercise_distance,
        target_heart_rate,
        pace,
        rpe,
        target_calories,
        target_mets
    ) VALUES (
        p_exercise_id,
        p_exercise_group_id,
        p_exercise_group_index,
        p_repetitions,
        p_exercise_sets,
        p_exercise_weight,
        p_exercise_duration,
        p_exercise_distance,
        p_target_heart_rate,
        p_pace,
        p_rpe,
        p_target_calories,
        p_target_mets
    );

    SELECT LAST_INSERT_ID() INTO INSERTED_ID;

    UPDATE PlannedExercise
    SET exercise_group_index = exercise_group_index + 1
    WHERE exercise_group_id = p_exercise_group_id
    AND exercise_group_index >= p_exercise_group_index
    AND id != INSERTED_ID;
END