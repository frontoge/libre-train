CREATE PROCEDURE spGetMicrocycleRoutines(
    IN p_microcycleId INT
)
BEGIN
    SELECT * FROM WorkoutRoutineExercises
    WHERE microcycle_id = p_microcycleId
    AND isActive = true;
END;