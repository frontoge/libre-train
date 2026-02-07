CREATE PROCEDURE spUpdateContact(
	IN p_id INT,
	IN p_first_name VARCHAR(100),
	IN p_last_name VARCHAR(100),
	IN p_email VARCHAR(100),
	IN p_phone VARCHAR(15),
	IN p_date_of_birth DATE,
	IN p_img VARCHAR(255),
	IN p_notes VARCHAR(500)
)
BEGIN
	UPDATE Contact
	SET
		first_name = COALESCE(p_first_name, first_name),
		last_name = COALESCE(p_last_name, last_name),
		email = COALESCE(p_email, email),
		phone = COALESCE(p_phone, phone),
		date_of_birth = COALESCE(p_date_of_birth, date_of_birth),
		img = COALESCE(p_img, img),
		notes = COALESCE(p_notes, notes)
	WHERE id = p_id;
END;
