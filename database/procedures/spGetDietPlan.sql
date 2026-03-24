CREATE PROCEDURE spGetDietPlan (
    IN p_plan_id INT,
    IN p_client_id INT,
    IN p_trainer_id INT,
    IN p_is_active BOOLEAN
)
BEGIN
    SELECT * FROM DietPlan
    WHERE (p_plan_id IS NULL OR id = p_plan_id)
    AND (p_client_id IS NULL OR clientId = p_client_id)
    AND (p_trainer_id IS NULL OR trainerId = p_trainer_id)
    AND (p_is_active IS NULL OR isActive = p_is_active);
END