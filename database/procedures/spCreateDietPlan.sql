CREATE PROCEDURE spCreateDietPlan (
    IN p_client_id INT,
    IN p_trainer_id INT,
    IN p_plan_name VARCHAR(255),
    IN p_target_calories INT,
    IN p_target_protein INT,
    IN p_target_carbs INT,
    IN p_target_fats INT,
    IN p_notes VARCHAR(512)
)
BEGIN
    UPDATE DietPlan SET isActive = FALSE WHERE clientId = p_client_id AND isActive = TRUE;
    INSERT INTO DietPlan (clientId, trainerId, planName, targetCalories, targetProtein, targetCarbs, targetFats, notes)
    VALUES (p_client_id, p_trainer_id, p_plan_name, p_target_calories, p_target_protein, p_target_carbs, p_target_fats, p_notes);
    
    SELECT LAST_INSERT_ID() AS new_plan_id;
END
