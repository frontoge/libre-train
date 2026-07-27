-- Seeds the permission catalog and the four built-in system permission groups, and creates
-- the UserEffectivePermission view (Prisma does not emit view DDL for `view` blocks, so it
-- must be created here, matching how the other views live in 0_init).

-- Permission catalog (code-defined; mirrors shared/permissions.ts).
INSERT INTO `Permission` (`key`, `label`, `description`, `category`) VALUES
    ('clients.view', 'View clients', 'See client profiles and history.', 'Clients'),
    ('clients.create', 'Create clients', 'Add new clients to the system.', 'Clients'),
    ('clients.edit', 'Edit clients', 'Update client details and notes.', 'Clients'),
    ('clients.delete', 'Delete clients', 'Permanently remove clients.', 'Clients'),
    ('training.view', 'View training plans', 'Browse macro / meso / microcycles.', 'Training'),
    ('training.create', 'Create training plans', 'Build new training cycles.', 'Training'),
    ('training.edit', 'Edit training plans', 'Modify routines and planned exercises.', 'Training'),
    ('training.delete', 'Delete training plans', 'Remove training cycles.', 'Training'),
    ('nutrition.view', 'View diet plans', 'See diet plans and logs.', 'Nutrition'),
    ('nutrition.manage', 'Manage diet plans', 'Create and edit diet plans and logs.', 'Nutrition'),
    ('assessments.view', 'View assessments', 'Read assessment history.', 'Assessments'),
    ('assessments.manage', 'Manage assessments', 'Record and edit assessments.', 'Assessments'),
    ('exercises.view', 'View exercise library', 'Browse the exercise catalog.', 'Exercises'),
    ('exercises.manage', 'Manage exercise library', 'Add and edit exercises.', 'Exercises'),
    ('contacts.view', 'View contacts', 'See leads and contacts.', 'Sales & Contacts'),
    ('contacts.manage', 'Manage contacts', 'Create, edit, and convert contacts.', 'Sales & Contacts'),
    ('billing.view', 'View billing', 'See invoices and payment status.', 'Sales & Contacts'),
    ('billing.manage', 'Manage billing', 'Create invoices and process payments.', 'Sales & Contacts'),
    ('settings.branding', 'Manage branding', 'Customize colors, logo, and copy.', 'Administration'),
    ('settings.users', 'Manage users', 'Create and manage user accounts.', 'Administration'),
    ('settings.permissions', 'Manage permissions', 'Configure permission groups.', 'Administration');

-- Built-in system groups (is_system = 1: cannot be deleted via the UI). Trainer is the
-- default group assigned to every new user (is_default = 1).
INSERT INTO `PermissionGroup` (`name`, `description`, `color`, `is_system`, `is_default`) VALUES
    ('Administrator', 'Full access to every area of the system.', '#f5222d', 1, 0),
    ('Trainer', 'Full access except system administration settings.', '#1677ff', 1, 1),
    ('Sales', 'Access to the Sales and Client areas.', '#fa8c16', 1, 0),
    ('Client', 'No access yet — reserved for the future client portal.', '#13c2c2', 1, 0);

-- Administrator: every permission.
INSERT INTO `PermissionGroupPermission` (`permissionGroupId`, `permissionId`)
SELECT `g`.`id`, `p`.`id`
FROM `PermissionGroup` `g`
JOIN `Permission` `p`
WHERE `g`.`name` = 'Administrator';

-- Trainer: everything except system administration settings.
INSERT INTO `PermissionGroupPermission` (`permissionGroupId`, `permissionId`)
SELECT `g`.`id`, `p`.`id`
FROM `PermissionGroup` `g`
JOIN `Permission` `p`
WHERE `g`.`name` = 'Trainer' AND `p`.`category` <> 'Administration';

-- Sales: the Sales & Contacts and Clients areas.
INSERT INTO `PermissionGroupPermission` (`permissionGroupId`, `permissionId`)
SELECT `g`.`id`, `p`.`id`
FROM `PermissionGroup` `g`
JOIN `Permission` `p`
WHERE `g`.`name` = 'Sales' AND `p`.`category` IN ('Sales & Contacts', 'Clients');

-- Client: no permissions yet (reserved for the future client portal).

-- Effective permissions per user: the de-duplicated set of permission keys granted across
-- all of a user's groups. Backs the UserEffectivePermission view in schema.prisma.
CREATE OR REPLACE VIEW `UserEffectivePermission` AS
SELECT DISTINCT
    `upg`.`userId` AS `userId`,
    `p`.`key` AS `permissionKey`
FROM `UserPermissionGroup` `upg`
JOIN `PermissionGroupPermission` `pgp` ON `pgp`.`permissionGroupId` = `upg`.`permissionGroupId`
JOIN `Permission` `p` ON `p`.`id` = `pgp`.`permissionId`;
