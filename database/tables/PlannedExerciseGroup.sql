CREATE TABLE PlannedExerciseGroup (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    workout_routine_id INT UNSIGNED NOT NULL,
    group_index INT NOT NULL,
    rest_between INT,
    rest_after INT,
    UNIQUE (workout_routine_id, group_index),
    PRIMARY KEY (id),
    CONSTRAINT fk_workout_routine FOREIGN KEY (workout_routine_id) REFERENCES WorkoutRoutine(id) ON DELETE CASCADE ON UPDATE NO ACTION,
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;