CREATE TABLE
  `ClientDailyLog` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `client_id` int(10) unsigned NOT NULL,
    `logged_weight` decimal(5, 1) DEFAULT NULL,
    `target_weight` decimal(5, 1) DEFAULT NULL,
    `body_fat` decimal(5, 1) DEFAULT NULL,
    `target_body_fat` decimal(5, 1) DEFAULT NULL,
    `logged_calories` int(11) DEFAULT NULL,
    `target_calories` int(11) DEFAULT NULL,
    `logged_protein` int(11) DEFAULT NULL,
    `target_protein` int(11) DEFAULT NULL,
    `logged_carbs` int(11) DEFAULT NULL,
    `target_carbs` int(11) DEFAULT NULL,
    `logged_fat` int(11) DEFAULT NULL,
    `target_fat` int(11) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `FK_CLIENTLOG_CLIENT` (`client_id`),
    CONSTRAINT `FK_CLIENTLOG_CLIENT` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci