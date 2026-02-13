CREATE TABLE `AssessmentClientLog` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `clientId` int(10) unsigned NOT NULL,
  `assessmentTypeId` int(10) unsigned NOT NULL,
  `assessmentValue` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `assessmentDate` date NOT NULL DEFAULT curdate(),
  `notes` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AssessmentClientLog_client_FK` (`clientId`),
  KEY `AssessmentClientLog_assessmentType_FK` (`assessmentTypeId`),
  CONSTRAINT `AssessmentClientLog_assessmentType_FK` FOREIGN KEY (`assessmentTypeId`) REFERENCES `AssessmentType` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AssessmentClientLog_client_FK` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci