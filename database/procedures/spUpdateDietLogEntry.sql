CREATE PROCEDURE spUpdateDietLogEntry (
    IN p_log_entry_id INT,
    IN p_calories INT,
    IN p_protein INT,
    IN p_carbs INT,
    IN p_fats INT
)
BEGIN
    UPDATE DietPlanLogEntry
    SET
        calories = COALESCE(p_calories, calories),
        protein = COALESCE(p_protein, protein),
        carbs = COALESCE(p_carbs, carbs),
        fats = COALESCE(p_fats, fats)
    WHERE id = p_log_entry_id;
END