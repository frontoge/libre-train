CREATE TABLE `PlannedExerciseGroup` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `workout_routine_id` int(10) unsigned NOT NULL,
  `group_index` int(11) NOT NULL,
  `rest_between` int(11) DEFAULT NULL,
  `rest_after` int(11) DEFAULT NULL,
  `routine_category` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PlannedExerciseGroup_index_3` (`workout_routine_id`, `group_index`),
  KEY `fk_group_workout_category` (`routine_category`),
  CONSTRAINT `fk_group_workout_category` FOREIGN KEY (`routine_category`) REFERENCES `WorkoutRoutineCategory` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_workout_routine` FOREIGN KEY (`workout_routine_id`) REFERENCES `WorkoutRoutine` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
)