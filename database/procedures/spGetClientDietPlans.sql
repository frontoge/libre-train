CREATE PROCEDURE spGetClientDietPlans (
    IN p_trainerId INT
)
BEGIN 
    SELECT first_name, last_name, trainerId, targetCalories, targetProtein, targetCarbs, targetFats, dietPlanId
    FROM ClientDietPlan
    WHERE p_trainerId IS NULL OR trainerId = p_trainerId;
END