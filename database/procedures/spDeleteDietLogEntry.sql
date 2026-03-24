CREATE PROCEDURE spDeleteDietLogEntry (
    IN p_log_entry_id INT
)
BEGIN
    DELETE FROM DietPlanLogEntry
    WHERE id = p_log_entry_id;
END
