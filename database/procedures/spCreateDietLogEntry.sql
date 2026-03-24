CREATE PROCEDURE spCreateDietLogEntry (
    IN p_client_id INT,
    IN p_date DATE,
    IN p_calories INT,
    IN p_protein INT,
    IN p_carbs INT,
    IN p_fats INT
)
BEGIN
    INSERT INTO DietPlanLogEntry (
        dietPlanId,
        clientId,
        logDate,
        calories,
        protein,
        carbs,
        fats
    )
    VALUES (
        (SELECT (id) FROM DietPlan WHERE clientId = p_client_id AND isActive = TRUE LIMIT 1),
        p_client_id,
        COALESCE(p_date, CURRENT_DATE),
        p_calories,
        p_protein,
        p_carbs,
        p_fats
    );

    SELECT LAST_INSERT_ID() AS newLogEntryId;
END 
