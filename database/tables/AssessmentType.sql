CREATE TABLE AssessmentType (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `assessmentUnit` varchar(255),
    `assessmentGroupId` int(10) unsigned,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `AssessmentType_assessmentGroup_FK` (`assessmentGroupId`),
    CONSTRAINT `AssessmentType_assessmentGroup_FK` FOREIGN KEY (`assessmentGroupId`) REFERENCES `AssessmentGroup` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);