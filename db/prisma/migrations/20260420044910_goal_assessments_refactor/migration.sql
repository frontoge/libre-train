/*
  Warnings:

  - You are about to drop the column `assessment_type_id` on the `ClientGoal` table. All the data in the column will be lost.
  - You are about to drop the column `goal_type_id` on the `ClientGoal` table. All the data in the column will be lost.
  - You are about to drop the column `target_assessment_value` on the `ClientGoal` table. All the data in the column will be lost.
  - You are about to drop the column `target_bodyfat` on the `ClientGoal` table. All the data in the column will be lost.
  - You are about to drop the column `target_weight` on the `ClientGoal` table. All the data in the column will be lost.
  - You are about to drop the `ClientGoalType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ClientGoal` DROP FOREIGN KEY `ClientGoal_assessmentType_FK`;

-- DropForeignKey
ALTER TABLE `ClientGoal` DROP FOREIGN KEY `ClientGoal_type_FK`;

-- DropIndex
DROP INDEX `ClientGoal_assessmentType_FK` ON `ClientGoal`;

-- DropIndex
DROP INDEX `ClientGoal_type_FK` ON `ClientGoal`;

-- AlterTable
ALTER TABLE `ClientGoal` DROP COLUMN `assessment_type_id`,
    DROP COLUMN `goal_type_id`,
    DROP COLUMN `target_assessment_value`,
    DROP COLUMN `target_bodyfat`,
    DROP COLUMN `target_weight`,
    MODIFY `status` ENUM('planned', 'in_progress', 'achieved', 'missed', 'abandoned') NOT NULL DEFAULT 'planned';

-- DropTable
DROP TABLE `ClientGoalType`;

-- CreateTable
CREATE TABLE `ClientGoalAssessment` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_goal_id` INTEGER UNSIGNED NOT NULL,
    `assessment_type_id` INTEGER UNSIGNED NOT NULL,
    `target_value` VARCHAR(500) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `ClientGoalAssessment_goal_FK`(`client_goal_id`),
    INDEX `ClientGoalAssessment_type_FK`(`assessment_type_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientGoalAssessment` ADD CONSTRAINT `ClientGoalAssessment_goal_FK` FOREIGN KEY (`client_goal_id`) REFERENCES `ClientGoal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoalAssessment` ADD CONSTRAINT `ClientGoalAssessment_type_FK` FOREIGN KEY (`assessment_type_id`) REFERENCES `AssessmentType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
