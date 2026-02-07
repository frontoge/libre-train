CREATE TABLE `WorkoutRoutineStage` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `stage_name` varchar(128) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
  PRIMARY KEY (`id`),
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci