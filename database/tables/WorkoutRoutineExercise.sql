CREATE TABLE
  `WorkoutRoutineExercise` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `routine_id` int(10) unsigned NOT NULL,
    `exercise_id` int(10) unsigned NOT NULL,
    `number_reps` int(10) NOT NULL DEFAULT 1,
    `number_sets` int(10) DEFAULT 1,
    `weight` float DEFAULT NULL,
    `duration` float DEFAULT NULL,
    `distance` float DEFAULT NULL,
    `rest_time` int(10) DEFAULT NULL,
    `pace` varchar(64) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `rpe` int(10) unsigned DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `WorkoutRoutineExercise_relation_1` (`exercise_id`),
    KEY `WorkoutRoutineExercise_relation_2` (`routine_id`),
    CONSTRAINT `WorkoutRoutineExercise_relation_1` FOREIGN KEY (`exercise_id`) REFERENCES `Exercise` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `WorkoutRoutineExercise_relation_2` FOREIGN KEY (`routine_id`) REFERENCES `WorkoutRoutine` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci