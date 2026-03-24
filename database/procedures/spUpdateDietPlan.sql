CREATE PROCEDURE spUpdateDietPlan (
    IN p_plan_id INT,
    IN p_plan_name VARCHAR(255),
    IN p_target_calories INT,
    IN p_target_protein INT,
    IN p_target_carbs INT,
    IN p_target_fats INT,
    IN p_is_active BOOLEAN,
    IN p_notes VARCHAR(512)
)
BEGIN
    UPDATE DietPlan
    SET 
        planName = COALESCE(p_plan_name, planName),
        targetCalories = COALESCE(p_target_calories, targetCalories),
        targetProtein = COALESCE(p_target_protein, targetProtein),
        targetCarbs = COALESCE(p_target_carbs, targetCarbs),
        targetFats = COALESCE(p_target_fats, targetFats),
        isActive = COALESCE(p_is_active, isActive),
        notes = COALESCE(p_notes, notes)
    WHERE id = p_plan_id;
    
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Diet plan not found';
    END IF;

    IF p_is_active THEN
        UPDATE DietPlan SET isActive = FALSE WHERE id != p_plan_id AND clientId = (SELECT clientId FROM DietPlan WHERE id = p_plan_id);
    END IF;
END