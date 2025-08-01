CREATE PROCEDURE `spGetClientDashboard` (IN p_client_id INT UNSIGNED, IN p_date DATE) BEGIN
WITH
  latestGoal (client_id, target_weight, created_at) AS (
    SELECT
      client_id,
      target_weight,
      created_at
    FROM
      ClientGoal
    WHERE
      client_id = p_client_id
      AND CAST(created_at AS DATE) <= CAST(p_date AS DATE)
    ORDER BY
      created_at DESC
    LIMIT
      1
  )
SELECT
  c.id,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  c.height,
  c.img,
  cdl.*,
  latestGoal.*
FROM
  ClientDailyLog cdl
  JOIN latestGoal ON latestGoal.client_id = cdl.client_id
  JOIN Client c ON c.id = cdl.client_id
WHERE
  CAST(cdl.created_at AS DATE) <= CAST(p_date AS DATE)
  AND cdl.client_id = p_client_id;

END