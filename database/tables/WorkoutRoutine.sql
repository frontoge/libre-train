CREATE TABLE `WorkoutRoutine` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `microcycle_id` int(10) unsigned NOT NULL,
  `routine_index` int(10) NOT NULL,
  `routine_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `WorkoutRoutine_parent` (`microcycle_id`),
  CONSTRAINT `WorkoutRoutine_parent` FOREIGN KEY (`microcycle_id`) REFERENCES `Microcycle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)