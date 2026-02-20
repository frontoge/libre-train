CREATE TABLE `Microcycle` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `mesocycle_id` int(10) unsigned NOT NULL,
  `client_id` int(10) unsigned NOT NULL,
  `cycle_name` varchar(255) DEFAULT NULL,
  `cycle_start_date` date NOT NULL,
  `cycle_end_date` date NOT NULL,
  `notes` varchar(512) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `mesocycle_id` (`mesocycle_id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `Microcycle_ibfk_1` FOREIGN KEY (`mesocycle_id`) REFERENCES `Mesocycle` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Microcycle_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE
)