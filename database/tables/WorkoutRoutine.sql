CREATE TABLE `WorkoutRoutine` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `workout_program_id` int(10) unsigned NOT NULL,
  `routine_day` int(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `routine_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `WorkoutRoutine_relation_1` (`workout_program_id`),
  CONSTRAINT `WorkoutRoutine_relation_1` FOREIGN KEY (`workout_program_id`) REFERENCES `WorkoutProgram` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci