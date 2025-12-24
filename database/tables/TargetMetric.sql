CREATE TABLE
  `TargetMetric` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `metric_name` varchar(64) NOT NULL,
    `target_unit` varchar(16) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`)
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci