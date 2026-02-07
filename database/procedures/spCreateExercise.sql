CREATE PROCEDURE `spCreateExercise` (
    IN p_exercise_name VARCHAR(64),
    IN p_muscle_groups VARCHAR(512),
    IN p_description VARCHAR(255),
    IN p_video_link VARCHAR(512)
) BEGIN
INSERT INTO 
    Exercise (
        exercise_name,
        muscle_groups,
        exercise_description,
        video_link
    )
VALUES
    (
        p_exercise_name,
        p_muscle_groups,
        p_description,
        p_video_link
    );
END