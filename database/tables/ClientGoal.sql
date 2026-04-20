CREATE TABLE
  `ClientGoal` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `client_id` int(10) unsigned NOT NULL,
    `macrocycle_id` int(10) unsigned DEFAULT NULL,
    `mesocycle_id` int(10) unsigned DEFAULT NULL,
    `microcycle_id` int(10) unsigned DEFAULT NULL,
    `description` varchar(512) DEFAULT NULL,
    `target_date` date DEFAULT NULL,
    `status` enum('planned','in_progress','achieved','missed','abandoned') NOT NULL DEFAULT 'planned',
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `ClientGoal_client_FK` (`client_id`),
    KEY `ClientGoal_macrocycle_FK` (`macrocycle_id`),
    KEY `ClientGoal_mesocycle_FK` (`mesocycle_id`),
    KEY `ClientGoal_microcycle_FK` (`microcycle_id`),
    CONSTRAINT `ClientGoal_client_FK` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ClientGoal_macrocycle_FK` FOREIGN KEY (`macrocycle_id`) REFERENCES `Macrocycle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ClientGoal_mesocycle_FK` FOREIGN KEY (`mesocycle_id`) REFERENCES `Mesocycle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ClientGoal_microcycle_FK` FOREIGN KEY (`microcycle_id`) REFERENCES `Microcycle` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci
