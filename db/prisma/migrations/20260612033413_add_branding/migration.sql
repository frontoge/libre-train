-- CreateTable
CREATE TABLE `Branding` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `brand_name` VARCHAR(100) NOT NULL,
    `logo_key` VARCHAR(255) NULL,
    `primary_color` VARCHAR(7) NULL,
    `secondary_color` VARCHAR(7) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
