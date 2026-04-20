/*
  Warnings:

  - You are about to drop the column `goal_id` on the `ClientGoal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ClientGoal` DROP FOREIGN KEY `FK_CLIENTGOAL_CLIENT`;

-- DropForeignKey
ALTER TABLE `ClientGoal` DROP FOREIGN KEY `FK_CLIENTGOAL_GOAL`;

-- DropIndex
DROP INDEX `FK_CLIENTGOAL_GOAL` ON `ClientGoal`;

-- AlterTable
ALTER TABLE `ClientGoal` DROP COLUMN `goal_id`,
    ADD COLUMN `assessment_type_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `description` VARCHAR(512) NULL,
    ADD COLUMN `goal_type_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `macrocycle_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `mesocycle_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `microcycle_id` INTEGER UNSIGNED NULL,
    ADD COLUMN `status` ENUM('in_progress', 'achieved', 'missed', 'abandoned') NOT NULL DEFAULT 'in_progress',
    ADD COLUMN `target_assessment_value` VARCHAR(500) NULL,
    ADD COLUMN `target_date` DATE NULL;

-- CreateIndex
CREATE INDEX `ClientGoal_type_FK` ON `ClientGoal`(`goal_type_id`);

-- CreateIndex
CREATE INDEX `ClientGoal_macrocycle_FK` ON `ClientGoal`(`macrocycle_id`);

-- CreateIndex
CREATE INDEX `ClientGoal_mesocycle_FK` ON `ClientGoal`(`mesocycle_id`);

-- CreateIndex
CREATE INDEX `ClientGoal_microcycle_FK` ON `ClientGoal`(`microcycle_id`);

-- CreateIndex
CREATE INDEX `ClientGoal_assessmentType_FK` ON `ClientGoal`(`assessment_type_id`);

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `ClientGoal_client_FK` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `ClientGoal_type_FK` FOREIGN KEY (`goal_type_id`) REFERENCES `ClientGoalType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `ClientGoal_macrocycle_FK` FOREIGN KEY (`macrocycle_id`) REFERENCES `Macrocycle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `ClientGoal_mesocycle_FK` FOREIGN KEY (`mesocycle_id`) REFERENCES `Mesocycle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `ClientGoal_microcycle_FK` FOREIGN KEY (`microcycle_id`) REFERENCES `Microcycle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `ClientGoal_assessmentType_FK` FOREIGN KEY (`assessment_type_id`) REFERENCES `AssessmentType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `ClientGoal_client_FK` ON `ClientGoal`(`client_id`);
DROP INDEX `FK_CLIENTGOAL_CLIENT` ON `ClientGoal`;
