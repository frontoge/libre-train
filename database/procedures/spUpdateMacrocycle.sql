CREATE PROCEDURE spUpdateMacrocycle (
    IN p_id INT UNSIGNED,
    IN p_cycle_name VARCHAR(255),
    IN p_cycle_start_date DATE,
    IN p_cycle_end_date DATE,
    IN p_isActive BOOLEAN,
    IN p_notes VARCHAR(512)
)
BEGIN

    DECLARE v_toUpdate_start DATE;
    DECLARE v_toUpdate_end DATE;

    SELECT cycle_start_date, cycle_end_date
        INTO v_toUpdate_start, v_toUpdate_end
    FROM Macrocycle
    WHERE id = p_id;

    IF (
        (p_cycle_start_date IS NOT NULL AND p_cycle_end_date IS NOT NULL AND p_cycle_start_date > p_cycle_end_date) OR
        (p_cycle_start_date IS NOT NULL AND p_cycle_end_date IS NULL AND p_cycle_start_date > v_toUpdate_end) OR
        (p_cycle_end_date IS NOT NULL AND p_cycle_start_date IS NULL AND p_cycle_end_date < v_toUpdate_start)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start must be before end date';
    END IF;

    # Update the macrocycle record with the provided values, using COALESCE to keep existing values if parameters are NULL
    UPDATE Macrocycle
    SET cycle_name = COALESCE(p_cycle_name, cycle_name),
        cycle_start_date = COALESCE(p_cycle_start_date, cycle_start_date),
        cycle_end_date = COALESCE(p_cycle_end_date, cycle_end_date),
        is_active = COALESCE(p_isActive, is_active),
        notes = COALESCE(p_notes, notes)
    WHERE id = p_id;

    # If setting updated record to active, set all overlapping cycles for the same client to inactive
    UPDATE Macrocycle mc
    INNER JOIN (
        SELECT 
            client_id,
            cycle_start_date,
            cycle_end_date
        FROM Macrocycle
        WHERE id = p_id
            AND is_active = TRUE
    ) as updatedRecord ON mc.client_id = updatedRecord.client_id
    SET mc.is_active = FALSE
    WHERE mc.is_active = TRUE
        AND mc.id != p_id
        AND mc.cycle_end_date >= updatedRecord.cycle_start_date
        AND updatedRecord.cycle_end_date >= mc.cycle_start_date;
END