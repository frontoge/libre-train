CREATE PROCEDURE `spCreateContact` (
  IN p_first_name VARCHAR(255),
  IN p_last_name VARCHAR(255),
  IN p_email VARCHAR(255),
  IN p_phone VARCHAR(255),
  IN p_dob DATE,
  IN p_img VARCHAR(255),
  IN p_notes VARCHAR(500)
) BEGIN
INSERT INTO
  Contact (
    first_name,
    last_name,
    email,
    phone,
    date_of_birth,
    img,
    notes
  )
VALUES
  (
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_dob,
    p_img,
    p_notes
  );

SELECT
  LAST_INSERT_ID() AS id;

END