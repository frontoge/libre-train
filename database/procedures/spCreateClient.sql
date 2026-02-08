CREATE PROCEDURE `spCreateClient` (
  IN p_client_id INT,
  IN p_trainer_id INT,
  IN p_height INT,
  IN p_notes VARCHAR(500)
) BEGIN
INSERT INTO
  Client (
    contactId,
    trainerId,
    height,
    isActive,
    notes
  )
VALUES (
    p_client_id,
    p_trainer_id,
    p_height,
    1,
    p_notes
);
SELECT
  LAST_INSERT_ID() AS id;
END