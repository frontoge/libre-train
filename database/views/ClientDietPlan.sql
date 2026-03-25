CREATE OR REPLACE VIEW ClientDietPlan AS
SELECT 
    cc.first_name,
    cc.last_name,
    cc.trainerId,
    dp.planName,
    dp.targetCalories,
    dp.targetProtein,
    dp.targetCarbs,
    dp.targetFats,
    dp.notes,
    dp.id as dietPlanId,
    cc.clientId
FROM ClientContact cc
LEFT JOIN DietPlan dp ON cc.clientId = dp.clientId
WHERE (dp.isActive = true OR dp.isActive IS NULL);