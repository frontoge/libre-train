-- CreateTable
CREATE TABLE `Permission` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(64) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `category` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Permission_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionGroup` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `color` VARCHAR(7) NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `PermissionGroup_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PermissionGroupPermission` (
    `permissionGroupId` INTEGER UNSIGNED NOT NULL,
    `permissionId` INTEGER UNSIGNED NOT NULL,

    INDEX `PermissionGroupPermission_permission_FK`(`permissionId`),
    PRIMARY KEY (`permissionGroupId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPermissionGroup` (
    `userId` INTEGER UNSIGNED NOT NULL,
    `permissionGroupId` INTEGER UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `UserPermissionGroup_group_FK`(`permissionGroupId`),
    PRIMARY KEY (`userId`, `permissionGroupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PermissionGroupPermission` ADD CONSTRAINT `PermissionGroupPermission_group_FK` FOREIGN KEY (`permissionGroupId`) REFERENCES `PermissionGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PermissionGroupPermission` ADD CONSTRAINT `PermissionGroupPermission_permission_FK` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermissionGroup` ADD CONSTRAINT `UserPermissionGroup_user_FK` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermissionGroup` ADD CONSTRAINT `UserPermissionGroup_group_FK` FOREIGN KEY (`permissionGroupId`) REFERENCES `PermissionGroup`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
