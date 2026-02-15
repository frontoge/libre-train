CREATE TABLE `Exercise` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `exercise_name` varchar(64) NOT NULL,
  `muscle_groups` varchar(512) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `video_link` varchar(512) DEFAULT NULL,
  `exercise_description` varchar(255) DEFAULT 'NULL',
  `equipment` varchar(512) DEFAULT NULL,
  `exercise_form` int(10) unsigned DEFAULT NULL,
  `movement_pattern` int(10) unsigned DEFAULT NULL,
  `progression_level` int(10) unsigned NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `Exercise_form_FK` (`exercise_form`),
  KEY `Exercise_movement_pattern_fk` (`movement_pattern`),
  CONSTRAINT `Exercise_form_FK` FOREIGN KEY (`exercise_form`) REFERENCES `ExerciseForm` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Exercise_movement_pattern_fk` FOREIGN KEY (`movement_pattern`) REFERENCES `ExerciseMovementPattern` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci