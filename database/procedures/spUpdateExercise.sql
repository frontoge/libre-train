CREATE PROCEDURE spUpdateExercise (
    IN p_exercise_id INT,
    IN p_exercise_name VARCHAR(64),
    IN p_muscle_groups VARCHAR(512),
    IN p_exercise_description VARCHAR(255),
    IN p_video_link VARCHAR(512),
    IN p_equipment VARCHAR(512),
    IN p_exercise_form INT,
    IN p_movement_pattern INT,
    IN p_progression_level INT
)
BEGIN
    UPDATE Exercise
    SET exercise_name = COALESCE(p_exercise_name, exercise_name),
        muscle_groups = COALESCE(p_muscle_groups, muscle_groups),
        exercise_description = COALESCE(p_exercise_description, exercise_description),
        video_link = COALESCE(p_video_link, video_link),
        equipment = COALESCE(p_equipment, equipment),
        exercise_form = COALESCE(p_exercise_form, exercise_form),
        movement_pattern = COALESCE(p_movement_pattern, movement_pattern),
        progression_level = COALESCE(p_progression_level, progression_level)
    WHERE id = p_exercise_id;
END