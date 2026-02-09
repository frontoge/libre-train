CREATE TABLE AssessmentClientLog(
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `clientId` int(10) unsigned NOT NULL,
    `assessmentTypeId` int(10) unsigned NOT NULL,
    `assessmentValue` decimal(10,2) NOT NULL,
    `assessmentDate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `AssessmentClientLog_client_FK` (`clientId`),
    KEY `AssessmentClientLog_assessmentType_FK` (`assessmentTypeId`),
    CONSTRAINT `AssessmentClientLog_client_FK` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `AssessmentClientLog_assessmentType_FK` FOREIGN KEY (`assessmentTypeId`) REFERENCES `AssessmentType` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);