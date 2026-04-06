CREATE PROCEDURE spGetClientsWithoutActiveTrainingPlan (
    IN p_trainerId INT
)
BEGIN
    SELECT
        cc.clientId,
        cc.first_name,
        cc.last_name,
        cc.email,
        cc.phone,
        cc.trainerId
    FROM ClientContact cc
    WHERE cc.trainerId = p_trainerId
      AND NOT EXISTS (
          SELECT 1
          FROM Macrocycle mc
          WHERE mc.client_id = cc.clientId
            AND mc.is_active = TRUE
      )
      AND NOT EXISTS (
          SELECT 1
          FROM Mesocycle ms
          WHERE ms.client_id = cc.clientId
            AND ms.is_active = TRUE
      )
      AND NOT EXISTS (
          SELECT 1
          FROM Microcycle mi
          WHERE mi.client_id = cc.clientId
            AND mi.is_active = TRUE
      );
END
