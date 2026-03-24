CREATE OR REPLACE VIEW ClientDietPlan AS
SELECT cc.first_name, cc.last_name, cc.trainerId, dp.targetCalories, dp.targetProtein, dp.targetCarbs, dp.targetFats, dp.id as dietPlanId
FROM ClientContact cc
LEFT JOIN DietPlan dp ON cc.clientId = dp.clientId
WHERE (dp.isActive = true OR dp.isActive IS NULL);