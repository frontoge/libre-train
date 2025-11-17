CREATE TABLE
  `Exercise` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `exercise_name` varchar(64) NOT NULL,
    `muscle_groups` varchar(512) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci