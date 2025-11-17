CREATE TABLE
    `WorkoutRoutineExercise` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `routine_id` int(10) NOT NULL,
    `exercise_id` int(10) NOT NULL,
    `reps` int(10) DEFAULT NULL,
    `sets` int(10) DEFAULT 1,
    `weight` float DEFAULT NULL,
    `duration` float DEFAULT NULL,
    `distance` float DEFAULT NULL,
    `rest_time` int(10) DEFAULT NULL,
    `pace` varchar(64) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci