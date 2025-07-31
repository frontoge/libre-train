CREATE TABLE
  `Client` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `first_name` varchar(100) NOT NULL,
    `last_name` varchar(100) NOT NULL,
    `age` int(10) unsigned DEFAULT NULL,
    `height` int(10) unsigned DEFAULT NULL,
    `email` varchar(100) DEFAULT NULL,
    `phone` varchar(15) DEFAULT NULL,
    `img` varchar(255) DEFAULT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci