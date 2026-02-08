CREATE PROCEDURE `spGetClientDashboard` (IN p_client_id INT UNSIGNED, IN p_date DATE) BEGIN
WITH
  latestGoal (
    client_id,
    goal,
    target_weight,
    target_bodyfat,
    created_at
  ) AS (
    SELECT
      cg.client_id,
      cgt.goal,
      cg.target_weight,
      cg.target_bodyfat,
      created_at
    FROM
      ClientGoal cg
      JOIN ClientGoalType cgt ON cgt.id = cg.goal_id
    WHERE
      cg.client_id = p_client_id
      AND CAST(created_at AS DATE) <= CAST(p_date AS DATE)
    ORDER BY
      created_at DESC
    LIMIT
      1
  )
SELECT
  c.id clientId,
  ct.first_name first_name,
  ct.last_name last_name,
  ct.phone phone,
  ct.email email,
  c.height height,
  ct.img img,
  cdl.logged_weight logged_weight,
  cdl.body_fat logged_bodyfat,
  cdl.logged_calories logged_calories,
  cdl.logged_protein logged_protein,
  cdl.logged_carbs logged_carbs,
  cdl.logged_fat logged_fat,
  cdl.target_calories target_calories,
  cdl.target_protein target_protein,
  cdl.target_carbs target_carbs,
  cdl.target_fat target_fat,
  latestGoal.goal goal,
  latestGoal.target_weight goal_weight,
  latestGoal.target_bodyfat goal_bodyFat
FROM
  ClientDailyLog cdl
  LEFT JOIN latestGoal ON latestGoal.client_id = cdl.client_id
  JOIN Client c ON c.id = cdl.client_id
  JOIN Contact ct ON ct.id = c.contactId
WHERE
  CAST(cdl.created_at AS DATE) = CAST(p_date AS DATE)
  AND cdl.client_id = p_client_id;

END