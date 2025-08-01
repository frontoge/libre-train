CREATE PROCEDURE `spCreateClientDailyLog` (
  IN p_client_id INT UNSIGNED,
  IN p_date DATE,
  IN p_logged_weight DECIMAL(5, 1),
  IN p_target_weight DECIMAL(5, 1),
  IN p_body_fat DECIMAL(5, 1),
  IN p_target_body_fat DECIMAL(5, 1),
  IN p_logged_calories INT,
  IN p_target_calories INT,
  IN p_logged_protein INT,
  IN p_target_protein INT,
  IN p_logged_carbs INT,
  IN p_target_carbs INT,
  IN p_logged_fat INT,
  IN p_target_fat INT
) BEGIN
INSERT INTO
  ClientDailyLog (
    client_id,
    logged_weight,
    target_weight,
    body_fat,
    target_body_fat,
    logged_calories,
    target_calories,
    logged_protein,
    target_protein,
    logged_carbs,
    target_carbs,
    logged_fat,
    target_fat,
    created_at
  )
VALUES
  (
    p_client_id,
    p_logged_weight,
    p_target_weight,
    p_body_fat,
    p_target_body_fat,
    p_logged_calories,
    p_target_calories,
    p_logged_protein,
    p_target_protein,
    p_logged_carbs,
    p_target_carbs,
    p_logged_fat,
    p_target_fat,
    p_date
  );

SELECT
  LAST_INSERT_ID() AS id;

END