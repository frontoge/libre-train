CREATE TABLE PlannedExercise (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT UNSIGNED NOT NULL,
    exercise_group_id INT UNSIGNED NOT NULL,
    repetitions INT,
    exercise_weight DECIMAL(10, 2),
    exercise_duration INT,
    exercise_distance DECIMAL(10, 2),
    target_heart_rate INT,
    pace VARCHAR(32),
    rpe INT,
    target_calories INT,
    target_mets INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exercise FOREIGN KEY (exercise_id) REFERENCES Exercise(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT fk_exercise_group FOREIGN KEY (exercise_group_id) REFERENCES PlannedExerciseGroup(id) ON DELETE CASCADE ON UPDATE NO ACTION
)