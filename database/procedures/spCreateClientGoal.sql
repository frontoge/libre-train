CREATE PROCEDURE `spCreateClientGoal` (
  IN p_client_id INT UNSIGNED,
  IN p_goal_type INT UNSIGNED,
  IN p_target_weight DOUBLE(5, 1),
  IN p_target_bodyfat DOUBLE(5, 1),
  IN p_date DATE
) BEGIN
INSERT INTO
  ClientGoal (client_id, goal_id, target_weight, target_bodyfat)
VALUES
  (
    p_client_id,
    p_goal_id,
    p_target_weight,
    p_target_bodyfat,
    IFNULL(
      p_date,
      CONVERT_TZ(NOW(), @@session.time_zone, 'America/New_York')
    )
  );

END