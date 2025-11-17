CREATE TABLE 
    `Plan` (
        `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `client_id` int(10) unsigned NOT NULL,
        `user_id` int(10) unsigned NOT NULL,
        `plan_label` varchar(128) NOT NULL,
        `parent_plan_id` int(10) unsigned DEFAULT NULL,
        `plan_phase` int(10) NOT NULL,
        `start_date` date DEFAULT NOW(),
        `end_date` date DEFAULT NULL,
        `is_active` boolean NOT NULL DEFAULT true,
        `workout_program_id` int(10) unsigned DEFAULT NULL,
        `target_metric_id` int(10) unsigned NOT NULL,
        `target_value` float NOT NULL,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci