CREATE PROCEDURE spUpdateMicrocycle (
    IN p_microcycle_id INT,
    IN p_name VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_notes VARCHAR(512),
    IN p_is_active BOOLEAN
)
BEGIN
    DECLARE v_meso_start DATE;
    DECLARE v_meso_end DATE;
    DECLARE v_toUpdate_start DATE;
    DECLARE v_toUpdate_end DATE;

    SELECT m.cycle_start_date, m.cycle_end_date, mi.cycle_start_date, mi.cycle_end_date
        INTO v_meso_start, v_meso_end, v_toUpdate_start, v_toUpdate_end
        FROM Mesocycle m
        INNER JOIN Microcycle mi ON m.id = mi.mesocycle_id
    WHERE mi.id = p_microcycle_id;

    IF (p_start_date IS NOT NULL AND p_start_date < v_meso_start) OR (p_end_date IS NOT NULL AND p_end_date > v_meso_end) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Microcycle dates must be within mesocycle dates';
    END IF;

    IF (
        (p_start_date IS NOT NULL AND p_end_date IS NOT NULL AND p_start_date > p_end_date) OR
        (p_start_date IS NOT NULL AND p_end_date IS NULL AND p_start_date > v_toUpdate_end) OR
        (p_end_date IS NOT NULL AND p_start_date IS NULL AND p_end_date < v_toUpdate_start)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start must be before end date';
    END IF;

    UPDATE Microcycle
    SET 
        cycle_name = COALESCE(p_name, cycle_name),
        cycle_start_date = COALESCE(p_start_date, cycle_start_date),
        cycle_end_date = COALESCE(p_end_date, cycle_end_date),
        notes = COALESCE(p_notes, notes),
        is_active = COALESCE(p_is_active, is_active)
    WHERE id = p_microcycle_id;

    UPDATE Microcycle mi
    INNER JOIN (
        SELECT 
            mesocycle_id,
            cycle_start_date,
            cycle_end_date
        FROM Microcycle
        WHERE id = p_microcycle_id
            AND is_active = TRUE
    ) AS updatedRecord ON mi.mesocycle_id = updatedRecord.mesocycle_id
    SET mi.is_active = FALSE
    WHERE mi.is_active = TRUE
        AND mi.id != p_microcycle_id
        AND mi.cycle_end_date >= updatedRecord.cycle_start_date
        AND updatedRecord.cycle_end_date >= mi.cycle_start_date;
END;