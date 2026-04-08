INSERT INTO AssessmentGroup (name)
VALUES
    ('Posture'),
    ('Composition'),
    ('Performance');

INSERT INTO AssessmentType (`id`, `name`, `assessmentUnit`, `assessmentGroupId`)
VALUES
    (1, 'Static', NULL, 1),
    (2, 'Push', NULL, 1),
    (3, 'Pull', NULL, 1),
    (4, 'Overhead Squat', NULL, 1),
    (5, 'Single leg squat', NULL, 1),
    (6, 'Weight', 'lbs', 2),
    (7, 'Body Fat Percentage', '%', 2),
    (8, 'Wrist Circumference', 'inches', 2),
    (9, 'Calf Circumference', 'inches', 2),
    (10, 'Bicep Circumference', 'inches', 2),
    (11, 'Chest Circumference', 'inches', 2),
    (12, 'Thigh Circumference', 'inches', 2),
    (13, 'Waist Circumference', 'inches', 2),
    (14, 'Shoulder Circumference', 'inches', 2),
    (15, 'Hip Circumference', 'inches', 2),
    (16, 'Forearm Circumference', 'inches', 2),
    (17, 'Neck Circumference', 'inches', 2),
    (18, 'Deadlift', 'lbs', 3),
    (19, 'Squat', 'lbs', 3),
    (20, 'Bench Press', 'lbs', 3),
    (21, 'Overhead Press', 'lbs', 3),
    (22, 'Pull Ups', 'reps', 3),
    (23, 'Push Ups', 'reps', 3),
    (24, 'Mile time', 'time', 3),
    (25, 'VO2 Max', 'ml/kg/min', 3),
    (26, '1.5 mile walk', 'time', 3),
    (27, '40 yard dash', 'time', 3),
    (28, 'Vertical Jump', 'inches', 3),
    (29, 'Lower Extremity Functional test (LEFT)', 'time', 3),
    (30, 'Long Jump', 'inches', 3),
    (31, 'Pro Shuttle', 'time', 3);

INSERT INTO ExerciseForm (id, exercise_form_name) VALUES
    (1, 'Flexibilty'),
    (2, 'Cardio'),
    (3, 'Core'),
    (4, 'Balance'),
    (5, 'Plyometric'),
    (6, 'SAQ'),
    (7, 'Resistance');

INSERT INTO ExerciseMovementPattern (id, pattern_name) VALUES
    (1, 'Squat'),
    (2, 'Hip Hinge'),
    (3, 'Push'),
    (4, 'Pull'),
    (5, 'Vertical Press');

INSERT INTO ClientGoalType (goal) VALUES
    ('Weight Loss'),
    ('Muscle Gain'),
    ('General Health'),
    ('Improve Strength'),
    ('Improve endurance'),
    ('BodyBuilding'),
    ('Powerlifting'),
    ('Other');

INSERT INTO WorkoutRoutineCategory (id, category_name)
VALUES
    (1, "Warmup"),
    (2, "Activation"),
    (3, "Skill Development"),
    (4, "Resistance Training"),
    (5, "Client's Choice"),
    (6, "Cooldown");