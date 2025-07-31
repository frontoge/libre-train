CREATE TABLE
  `ClientMeasurement` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `client_id` int(10) unsigned NOT NULL,
    `wrist` decimal(5, 3) DEFAULT NULL,
    `calves` decimal(5, 3) DEFAULT NULL,
    `biceps` decimal(5, 3) DEFAULT NULL,
    `chest` decimal(5, 3) DEFAULT NULL,
    `thighs` decimal(5, 3) DEFAULT NULL,
    `waist` decimal(5, 3) DEFAULT NULL,
    `shoulders` decimal(5, 3) DEFAULT NULL,
    `hips` decimal(5, 3) DEFAULT NULL,
    `forearms` decimal(5, 3) DEFAULT NULL,
    `neck` decimal(5, 3) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `client_id` (`client_id`),
    CONSTRAINT `ClientMeasurement_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci