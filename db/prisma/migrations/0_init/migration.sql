-- CreateTable
CREATE TABLE `AssessmentClientLog` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER UNSIGNED NOT NULL,
    `assessmentTypeId` INTEGER UNSIGNED NOT NULL,
    `assessmentValue` VARCHAR(500) NOT NULL,
    `assessmentDate` DATE NOT NULL DEFAULT (curdate()),
    `notes` VARCHAR(512) NULL,

    INDEX `AssessmentClientLog_assessmentType_FK`(`assessmentTypeId`),
    INDEX `AssessmentClientLog_client_FK`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssessmentGroup` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AssessmentType` (
    `id` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `assessmentUnit` VARCHAR(255) NULL,
    `assessmentGroupId` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `AssessmentType_assessmentGroup_FK`(`assessmentGroupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `height` INTEGER UNSIGNED NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `contactId` INTEGER UNSIGNED NOT NULL,
    `trainerId` INTEGER UNSIGNED NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `notes` VARCHAR(500) NULL,

    INDEX `Client_contact_FK`(`contactId`),
    INDEX `Client_trainer_FK`(`trainerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientDailyLog` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER UNSIGNED NOT NULL,
    `logged_weight` DECIMAL(5, 1) NULL,
    `body_fat` DECIMAL(5, 1) NULL,
    `logged_calories` INTEGER NULL,
    `target_calories` INTEGER NULL,
    `logged_protein` INTEGER NULL,
    `target_protein` INTEGER NULL,
    `logged_carbs` INTEGER NULL,
    `target_carbs` INTEGER NULL,
    `logged_fat` INTEGER NULL,
    `target_fat` INTEGER NULL,
    `created_at` DATE NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `idx_client_date`(`client_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientGoal` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER UNSIGNED NOT NULL,
    `goal_id` INTEGER UNSIGNED NULL,
    `target_weight` DOUBLE NULL,
    `target_bodyfat` DOUBLE NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_CLIENTGOAL_CLIENT`(`client_id`),
    INDEX `FK_CLIENTGOAL_GOAL`(`goal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientGoalType` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `goal` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NULL,
    `date_of_birth` DATE NULL,
    `img` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DietPlan` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `planName` VARCHAR(255) NOT NULL,
    `clientId` INTEGER UNSIGNED NOT NULL,
    `trainerId` INTEGER UNSIGNED NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `targetCalories` INTEGER NOT NULL,
    `targetProtein` INTEGER NOT NULL,
    `targetCarbs` INTEGER NOT NULL,
    `targetFats` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `notes` VARCHAR(512) NULL,

    INDEX `DietPlan_client_FK`(`clientId`),
    INDEX `DietPlan_trainer_FK`(`trainerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DietPlanLogEntry` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `dietPlanId` INTEGER UNSIGNED NOT NULL,
    `clientId` INTEGER UNSIGNED NOT NULL,
    `logDate` DATE NOT NULL,
    `calories` INTEGER NOT NULL,
    `protein` INTEGER NOT NULL,
    `carbs` INTEGER NOT NULL,
    `fats` INTEGER NOT NULL,

    INDEX `DietPlanLogEntry_client_FK`(`clientId`),
    INDEX `DietPlanLogEntry_dietPlan_FK`(`dietPlanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exercise` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `exercise_name` VARCHAR(64) NOT NULL,
    `muscle_groups` VARCHAR(512) NULL DEFAULT 'NULL',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `video_link` VARCHAR(512) NULL,
    `exercise_description` VARCHAR(255) NULL DEFAULT 'NULL',
    `equipment` VARCHAR(512) NULL,
    `exercise_form` INTEGER UNSIGNED NULL,
    `movement_pattern` INTEGER UNSIGNED NULL,
    `progression_level` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `Exercise_form_FK`(`exercise_form`),
    INDEX `Exercise_movement_pattern_fk`(`movement_pattern`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExerciseForm` (
    `id` INTEGER UNSIGNED NOT NULL,
    `exercise_form_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExerciseMovementPattern` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `pattern_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Macrocycle` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `cycle_name` VARCHAR(255) NULL,
    `client_id` INTEGER UNSIGNED NOT NULL,
    `cycle_start_date` DATE NOT NULL,
    `cycle_end_date` DATE NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `notes` VARCHAR(512) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `client_id`(`client_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mesocycle` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER UNSIGNED NOT NULL,
    `cycle_name` VARCHAR(255) NULL,
    `macrocycle_id` INTEGER UNSIGNED NOT NULL,
    `cycle_start_date` DATE NOT NULL,
    `cycle_end_date` DATE NOT NULL,
    `opt_levels` VARCHAR(255) NULL,
    `cardio_levels` VARCHAR(255) NULL,
    `notes` VARCHAR(512) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `client_id`(`client_id`),
    INDEX `macrocycle_id`(`macrocycle_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Microcycle` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `mesocycle_id` INTEGER UNSIGNED NOT NULL,
    `client_id` INTEGER UNSIGNED NOT NULL,
    `cycle_name` VARCHAR(255) NULL,
    `cycle_start_date` DATE NOT NULL,
    `cycle_end_date` DATE NOT NULL,
    `notes` VARCHAR(512) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `client_id`(`client_id`),
    INDEX `mesocycle_id`(`mesocycle_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlannedExercise` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `exercise_id` INTEGER UNSIGNED NOT NULL,
    `exercise_group_id` INTEGER UNSIGNED NOT NULL,
    `repetitions` INTEGER NULL,
    `exercise_weight` INTEGER NULL,
    `exercise_duration` INTEGER NULL,
    `exercise_distance` DECIMAL(10, 2) NULL,
    `target_heart_rate` INTEGER NULL,
    `pace` VARCHAR(32) NULL,
    `rpe` INTEGER NULL,
    `target_calories` INTEGER NULL,
    `target_mets` INTEGER NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `exercise_sets` INTEGER NULL,
    `exercise_group_index` INTEGER NOT NULL,

    INDEX `fk_exercise`(`exercise_id`),
    INDEX `fk_exercise_group`(`exercise_group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlannedExerciseGroup` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `workout_routine_id` INTEGER UNSIGNED NOT NULL,
    `group_index` INTEGER NOT NULL,
    `rest_between` INTEGER NULL,
    `rest_after` INTEGER NULL,
    `routine_category` INTEGER UNSIGNED NOT NULL,

    INDEX `fk_group_workout_category`(`routine_category`),
    UNIQUE INDEX `PlannedExerciseGroup_index_3`(`workout_routine_id`, `group_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `contactId` INTEGER UNSIGNED NOT NULL,

    INDEX `User_contact_FK`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutRoutine` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `microcycle_id` INTEGER UNSIGNED NOT NULL,
    `routine_index` INTEGER NOT NULL,
    `routine_name` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `isActive` BOOLEAN NOT NULL DEFAULT false,

    INDEX `WorkoutRoutine_parent`(`microcycle_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkoutRoutineCategory` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AssessmentClientLog` ADD CONSTRAINT `AssessmentClientLog_assessmentType_FK` FOREIGN KEY (`assessmentTypeId`) REFERENCES `AssessmentType`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentClientLog` ADD CONSTRAINT `AssessmentClientLog_client_FK` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AssessmentType` ADD CONSTRAINT `AssessmentType_assessmentGroup_FK` FOREIGN KEY (`assessmentGroupId`) REFERENCES `AssessmentGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_contact_FK` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_trainer_FK` FOREIGN KEY (`trainerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientDailyLog` ADD CONSTRAINT `FK_CLIENTLOG_CLIENT` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `FK_CLIENTGOAL_CLIENT` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientGoal` ADD CONSTRAINT `FK_CLIENTGOAL_GOAL` FOREIGN KEY (`goal_id`) REFERENCES `ClientGoalType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlan` ADD CONSTRAINT `DietPlan_client_FK` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlan` ADD CONSTRAINT `DietPlan_trainer_FK` FOREIGN KEY (`trainerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlanLogEntry` ADD CONSTRAINT `DietPlanLogEntry_client_FK` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DietPlanLogEntry` ADD CONSTRAINT `DietPlanLogEntry_dietPlan_FK` FOREIGN KEY (`dietPlanId`) REFERENCES `DietPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_form_FK` FOREIGN KEY (`exercise_form`) REFERENCES `ExerciseForm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_movement_pattern_fk` FOREIGN KEY (`movement_pattern`) REFERENCES `ExerciseMovementPattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Macrocycle` ADD CONSTRAINT `Macrocycle_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mesocycle` ADD CONSTRAINT `Mesocycle_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Mesocycle` ADD CONSTRAINT `Mesocycle_ibfk_2` FOREIGN KEY (`macrocycle_id`) REFERENCES `Macrocycle`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Microcycle` ADD CONSTRAINT `Microcycle_ibfk_1` FOREIGN KEY (`mesocycle_id`) REFERENCES `Mesocycle`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Microcycle` ADD CONSTRAINT `Microcycle_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `PlannedExercise` ADD CONSTRAINT `fk_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `Exercise`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `PlannedExercise` ADD CONSTRAINT `fk_exercise_group` FOREIGN KEY (`exercise_group_id`) REFERENCES `PlannedExerciseGroup`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `PlannedExerciseGroup` ADD CONSTRAINT `fk_group_workout_category` FOREIGN KEY (`routine_category`) REFERENCES `WorkoutRoutineCategory`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `PlannedExerciseGroup` ADD CONSTRAINT `fk_workout_routine` FOREIGN KEY (`workout_routine_id`) REFERENCES `WorkoutRoutine`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_contact_FK` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutRoutine` ADD CONSTRAINT `WorkoutRoutine_parent` FOREIGN KEY (`microcycle_id`) REFERENCES `Microcycle`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE VIEW `ClientContact` AS
SELECT
  `cl`.`id` AS `ClientId`,
  `c`.`id` AS `ContactId`,
  `c`.`first_name` AS `first_name`,
  `c`.`last_name` AS `last_name`,
  `c`.`email` AS `email`,
  `c`.`phone` AS `phone`,
  `c`.`date_of_birth` AS `date_of_birth`,
  `cl`.`height` AS `height`,
  `cl`.`trainerId` AS `trainerId`,
  `c`.`img` AS `img`,
  `cl`.`notes` AS `notes`
FROM
  (
    `libre_train`.`Client` `cl`
    JOIN `libre_train`.`Contact` `c` ON(`c`.`id` = `cl`.`contactId`)
  );

CREATE OR REPLACE VIEW `ClientDietPlan` AS
SELECT
  `cc`.`first_name` AS `first_name`,
  `cc`.`last_name` AS `last_name`,
  `cc`.`trainerId` AS `trainerId`,
  `dp`.`planName` AS `planName`,
  `dp`.`targetCalories` AS `targetCalories`,
  `dp`.`targetProtein` AS `targetProtein`,
  `dp`.`targetCarbs` AS `targetCarbs`,
  `dp`.`targetFats` AS `targetFats`,
  `dp`.`notes` AS `notes`,
  `dp`.`id` AS `dietPlanId`,
  `cc`.`ClientId` AS `clientId`
FROM
  (
    `libre_train`.`ClientContact` `cc`
    LEFT JOIN `libre_train`.`DietPlan` `dp` ON(
      `cc`.`ClientId` = `dp`.`clientId`
      AND `dp`.`isActive` = 1
    )
  );

CREATE OR REPLACE VIEW `WorkoutRoutineExercises` AS
SELECT
  `wr`.`id` AS `routineId`,
  `wr`.`microcycle_id` AS `microcycle_id`,
  `wr`.`routine_index` AS `routine_index`,
  `wr`.`routine_name` AS `routine_name`,
  `wr`.`isActive` AS `isActive`,
  `peg`.`group_index` AS `group_index`,
  `peg`.`rest_after` AS `rest_after`,
  `peg`.`rest_between` AS `rest_between`,
  `peg`.`routine_category` AS `routine_category`,
  `pe`.`exercise_id` AS `exercise_id`,
  `e`.`exercise_name` AS `exercise_name`,
  `pe`.`exercise_group_index` AS `exercise_group_index`,
  `pe`.`repetitions` AS `repetitions`,
  `pe`.`exercise_sets` AS `exercise_sets`,
  `pe`.`exercise_weight` AS `exercise_weight`,
  `pe`.`exercise_duration` AS `exercise_duration`,
  `pe`.`exercise_distance` AS `exercise_distance`,
  `pe`.`target_heart_rate` AS `target_heart_rate`,
  `pe`.`pace` AS `pace`,
  `pe`.`rpe` AS `rpe`,
  `pe`.`target_calories` AS `target_calories`,
  `pe`.`target_mets` AS `target_mets`
FROM
  (
    (
      `libre_train`.`WorkoutRoutine` `wr`
      LEFT JOIN (
        `libre_train`.`PlannedExercise` `pe`
        JOIN `libre_train`.`PlannedExerciseGroup` `peg` ON(`peg`.`id` = `pe`.`exercise_group_id`)
      ) ON(`wr`.`id` = `peg`.`workout_routine_id`)
    )
    LEFT JOIN `libre_train`.`Exercise` `e` ON(`pe`.`exercise_id` = `e`.`id`)
  )
ORDER BY
  `wr`.`id`,
  `peg`.`group_index`,
  `pe`.`exercise_group_index`;