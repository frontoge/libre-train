CREATE VIEW WorkoutRoutineExercises AS
SELECT 
  wr.id as routineId,
  wr.microcycle_id,
  wr.routine_index,
  wr.routine_name,
  wr.isActive,
  peg.group_index,
  peg.rest_after,
  peg.rest_between,
  pe.exercise_id,
  pe.exercise_group_index,
  pe.repetitions,
  pe.exercise_sets,
  pe.exercise_weight,
  pe.exercise_duration,
  pe.exercise_distance,
  pe.target_heart_rate,
  pe.pace,
  pe.rpe,
  pe.target_calories,
  pe.target_mets
FROM PlannedExercise pe
  JOIN PlannedExerciseGroup peg ON peg.id = pe.exercise_group_id
  JOIN WorkoutRoutine wr ON wr.id = peg.workout_routine_id
ORDER BY
  routineId ASC,
  group_index ASC,
  exercise_group_index ASC
  