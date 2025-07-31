CREATE TABLE
  `ClientMeasurement` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `client_id` int(10) unsigned NOT NULL,
    `client_weight` decimal(5, 1) NOT NULL,
    `body_fat` decimal(5, 1) NOT NULL,
    `wrist` decimal(5, 3) NOT NULL,
    `calves` decimal(5, 3) NOT NULL,
    `biceps` decimal(5, 3) NOT NULL,
    `chest` decimal(5, 3) NOT NULL,
    `thighs` decimal(5, 3) NOT NULL,
    `waist` decimal(5, 3) NOT NULL,
    `shoulders` decimal(5, 3) NOT NULL,
    `hips` decimal(5, 3) NOT NULL,
    `forearms` decimal(5, 3) NOT NULL,
    `neck` decimal(5, 3) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `client_id` (`client_id`),
    CONSTRAINT `ClientMeasurement_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client` (`id`) ON DELETE CASCADE
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci