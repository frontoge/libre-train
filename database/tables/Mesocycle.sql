CREATE TABLE `Mesocycle` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int(10) unsigned NOT NULL,
  `cycle_name` varchar(255) DEFAULT NULL,
  `macrocycle_id` int(10) unsigned NOT NULL,
  `cycle_start_date` date NOT NULL,
  `cycle_end_date` date NOT NULL,
  `opt_levels` varchar(255) DEFAULT NULL,
  `cardio_levels` varchar(255) DEFAULT NULL,
  `notes` varchar(512) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `macrocycle_id` (`macrocycle_id`),
  CONSTRAINT `Mesocycle_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Mesocycle_ibfk_2` FOREIGN KEY (`macrocycle_id`) REFERENCES `Macrocycle` (`id`) ON DELETE CASCADE
)