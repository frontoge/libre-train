CREATE PROCEDURE spCreateMacrocycle (
    IN p_client_id INT UNSIGNED,
    IN p_cycle_name VARCHAR(255),
    IN p_cycle_start_date DATE,
    IN p_cycle_end_date DATE,
    IN p_isActive BOOLEAN,
    IN p_notes VARCHAR(512)
)
BEGIN

    IF p_cycle_start_date > p_cycle_end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date must be before end date';
    END IF;

    IF p_isActive OR p_isActive IS NULL THEN
        UPDATE Macrocycle mc
        SET mc.is_active = FALSE
        WHERE mc.client_id = p_client_id
            AND mc.is_active = TRUE
            AND mc.cycle_end_date >= p_cycle_start_date
            AND p_cycle_end_date >= mc.cycle_start_date;
    END IF;

    INSERT INTO Macrocycle (client_id, cycle_name, cycle_start_date, cycle_end_date, is_active, notes)
    VALUES (p_client_id, p_cycle_name, p_cycle_start_date, p_cycle_end_date, p_isActive, p_notes);
END