CREATE PROCEDURE `spCreateClientMeasurement` (
  p_client_id INT UNSIGNED,
  p_wrist DECIMAL(5, 3),
  p_calves DECIMAL(5, 3),
  p_biceps DECIMAL(5, 3),
  p_chest DECIMAL(5, 3),
  p_thighs DECIMAL(5, 3),
  p_waist DECIMAL(5, 3),
  p_shoulders DECIMAL(5, 3),
  p_hips DECIMAL(5, 3),
  p_forearms DECIMAL(5, 3),
  p_neck DECIMAL(5, 3)
) BEGIN
INSERT INTO
  ClientMeasurement (
    client_id,
    wrist,
    calves,
    biceps,
    chest,
    thighs,
    waist,
    shoulders,
    hips,
    forearms,
    neck
  )
VALUES
  (
    p_client_id,
    p_wrist,
    p_calves,
    p_biceps,
    p_chest,
    p_thighs,
    p_waist,
    p_shoulders,
    p_hips,
    p_forearms,
    p_neck
  );

END