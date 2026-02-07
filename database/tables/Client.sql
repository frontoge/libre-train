CREATE TABLE `Client` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `height` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `contactId` int(10) unsigned NOT NULL,
  `trainerId` int(10) unsigned NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `Client_contact_FK` (`contactId`),
  KEY `Client_trainer_FK` (`trainerId`),
  CONSTRAINT `Client_contact_FK` FOREIGN KEY (`contactId`) REFERENCES `Contact` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Client_trainer_FK` FOREIGN KEY (`trainerId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci