CREATE PROCEDURE `spCreateExercise` (
    IN p_exercise_name VARCHAR(64),
    IN p_muscle_groups VARCHAR(512),
    IN p_description VARCHAR(255),
    IN p_video_link VARCHAR(512),
    IN p_equipment VARCHAR(512),
    IN p_exercise_form INT,
    IN p_movement_pattern INT,
    IN p_progression_level INT
) BEGIN
INSERT INTO 
    Exercise (
        exercise_name,
        muscle_groups,
        exercise_description,
        video_link,
        equipment,
        exercise_form,
        movement_pattern,
        progression_level
    )
VALUES
    (
        p_exercise_name,
        p_muscle_groups,
        p_description,
        p_video_link,
        p_equipment,
        p_exercise_form,
        p_movement_pattern,
        p_progression_level
    );
END