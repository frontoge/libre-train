CREATE TABLE
  `ClientGoal` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `client_id` int(10) unsigned NOT NULL,
    `goal_id` int(10) unsigned DEFAULT NULL,
    `target_weight` double(5, 1) DEFAULT NULL,
    `target_bodyfat` double(5, 1) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `FK_CLIENTGOAL_CLIENT` (`client_id`),
    KEY `FK_CLIENTGOAL_GOAL` (`goal_id`),
    CONSTRAINT `FK_CLIENTGOAL_CLIENT` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FK_CLIENTGOAL_GOAL` FOREIGN KEY (`goal_id`) REFERENCES `ClientGoalType` (`id`) ON DELETE
    SET
      NULL ON UPDATE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci