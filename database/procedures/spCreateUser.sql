CREATE PROCEDURE `spCreateUser` (
  IN p_username VARCHAR(32),
  IN p_password VARCHAR(255)
) BEGIN
INSERT INTO
  User (
    username,
    pass
  )
VALUES
  (
    p_username,
    p_password
  );

SELECT
  LAST_INSERT_ID() AS id;
END