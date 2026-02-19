CREATE TABLE `Macrocycle` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cycle_name` varchar(255) DEFAULT NULL,
  `client_id` int(10) unsigned NOT NULL,
  `cycle_start_date` date NOT NULL,
  `cycle_end_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `Macrocycle_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`)
);