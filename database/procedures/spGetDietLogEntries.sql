CREATE PROCEDURE spGetDietLogEntries (
    IN p_log_entry_id INT,
    IN p_client_id INT,
    IN p_diet_plan_id INT,
    IN p_log_date DATE,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT
        id,
        dietPlanId,
        clientId,
        logDate,
        calories,
        protein,
        carbs,
        fats
    FROM DietPlanLogEntry
    WHERE (p_log_entry_id IS NULL OR id = p_log_entry_id)
        AND (p_client_id IS NULL OR clientId = p_client_id)
        AND (p_diet_plan_id IS NULL OR dietPlanId = p_diet_plan_id)
        AND (p_log_date IS NULL OR logDate = p_log_date)
        AND (p_start_date IS NULL OR logDate >= p_start_date)
        AND (p_end_date IS NULL OR logDate <= p_end_date)
    ORDER BY logDate DESC;
END
