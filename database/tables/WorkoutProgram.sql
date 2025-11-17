CREATE TABLE
    `WorkoutProgram` (
        `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `plan_id` int(10) NOT NULL,
        `is_active` boolean NOT NULL DEFAULT true,
        `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci