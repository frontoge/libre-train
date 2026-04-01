CREATE PROCEDURE spUpdateClient(
	IN p_id INT,
	IN p_height INT,
    IN p_notes varchar(500),
    IN p_trainer_id INT
)
BEGIN
	UPDATE Client
	SET
		height = COALESCE(p_height, height),
		notes = COALESCE(p_notes, notes),
		trainerId = COALESCE(p_trainer_id, trainerId)
	WHERE id = p_id;
END;
