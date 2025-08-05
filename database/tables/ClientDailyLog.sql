CREATE TABLE
  `ClientDailyLog` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `client_id` int(10) unsigned NOT NULL,
    `logged_weight` decimal(5, 1) DEFAULT NULL,
    `body_fat` decimal(5, 1) DEFAULT NULL,
    `logged_calories` int(11) DEFAULT NULL,
    `target_calories` int(11) DEFAULT NULL,
    `logged_protein` int(11) DEFAULT NULL,
    `target_protein` int(11) DEFAULT NULL,
    `logged_carbs` int(11) DEFAULT NULL,
    `target_carbs` int(11) DEFAULT NULL,
    `logged_fat` int(11) DEFAULT NULL,
    `target_fat` int(11) DEFAULT NULL,
    `created_at` date DEFAULT NULL,
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_client_date` (`client_id`, `created_at`),
    CONSTRAINT `FK_CLIENTLOG_CLIENT` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci