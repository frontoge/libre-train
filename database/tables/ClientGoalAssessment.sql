CREATE TABLE
  `ClientGoalAssessment` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `client_goal_id` int(10) unsigned NOT NULL,
    `assessment_type_id` int(10) unsigned NOT NULL,
    `target_value` varchar(500) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `ClientGoalAssessment_goal_FK` (`client_goal_id`),
    KEY `ClientGoalAssessment_type_FK` (`assessment_type_id`),
    CONSTRAINT `ClientGoalAssessment_goal_FK` FOREIGN KEY (`client_goal_id`) REFERENCES `ClientGoal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `ClientGoalAssessment_type_FK` FOREIGN KEY (`assessment_type_id`) REFERENCES `AssessmentType` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci
