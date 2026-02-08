CREATE PROCEDURE `spCreateClient` (
  IN p_client_id INT,
  IN p_trainer_id INT,
  IN p_height INT
) BEGIN
INSERT INTO
  Client (
    contactId,
    trainerId,
    height,
    isActive
  )
VALUES (
    p_client_id,
    p_trainer_id,
    p_height,
    1
);
SELECT
  LAST_INSERT_ID() AS id;
END