CREATE PROCEDURE spGetDietLogTodosByTrainer (
    IN p_trainerId INT
)
BEGIN
    SELECT
        cc.clientId,
        cc.first_name,
        cc.last_name,
        cc.email,
        cc.phone,
        cc.trainerId,
        ll.lastLogDate
    FROM ClientContact cc
    LEFT JOIN (
        SELECT
            dple.clientId,
            MAX(dple.logDate) AS lastLogDate
        FROM DietPlanLogEntry dple
        GROUP BY dple.clientId
    ) ll
      ON ll.clientId = cc.clientId
    WHERE cc.trainerId = p_trainerId
      AND EXISTS (
          SELECT 1
          FROM DietPlan dp
          WHERE dp.clientId = cc.clientId
            AND dp.isActive = TRUE
      )
      AND NOT EXISTS (
          SELECT 1
          FROM DietPlanLogEntry dple
          JOIN DietPlan dp
            ON dp.id = dple.dietPlanId
          WHERE dp.clientId = cc.clientId
            AND dp.isActive = TRUE
            AND dple.logDate = CURDATE()
      );
END
