CREATE PROCEDURE spGetClientWeeklySummary (
  IN p_startDate DATE,
  IN p_endDate DATE,
  IN p_clientId INT UNSIGNED
)
BEGIN
  SELECT 
    AVG(cdl.logged_weight) AS avg_weight,
    AVG(cdl.body_fat) AS avg_bodyfat,
    AVG(cdl.logged_calories) AS avg_calories,
    SUM(cdl.logged_carbs + cdl.logged_protein + cdl.logged_fat) AS total_macros,
    SUM(cdl.target_carbs + cdl.target_protein + cdl.target_fat) AS target_macros
  FROM ClientDailyLog cdl
  WHERE
    p_startDate <= cdl.created_at AND p_endDate >= cdl.created_at
    AND
    cdl.client_id = p_clientId
  UNION
  SELECT 
    AVG(cdl.logged_weight) AS avg_weight,
    AVG(cdl.body_fat) AS avg_bodyfat,
    AVG(cdl.logged_calories) AS avg_calories,
    SUM(cdl.logged_carbs + cdl.logged_protein + cdl.logged_fat) AS total_macros,
    SUM(cdl.target_carbs + cdl.target_protein + cdl.target_fat) AS target_macros
  FROM ClientDailyLog cdl
  WHERE
    DATE_SUB(p_startDate, INTERVAL 7 DAY) <= cdl.created_at AND DATE_SUB(p_endDate, INTERVAL 7 DAY) >= cdl.created_at
    AND
    cdl.client_id = p_clientId;
END









