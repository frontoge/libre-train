CREATE PROCEDURE spUpdateMesocycle (
    IN p_mesocycle_id INT,
    IN p_name VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_opt_levels VARCHAR(255),
    IN p_cardio_levels VARCHAR(255),
    IN p_notes VARCHAR(512),
    IN p_is_active BOOLEAN
)
BEGIN
    # Check if updated values are within parent macrocycle range
    DECLARE v_macro_start DATE;
    DECLARE v_macro_end DATE;
    DECLARE v_toUpdate_start DATE;
    DECLARE v_toUpdate_end DATE;

    SELECT m.cycle_start_date, m.cycle_end_date, ms.cycle_start_date, ms.cycle_end_date
      INTO v_macro_start, v_macro_end, v_toUpdate_start, v_toUpdate_end
      FROM Macrocycle m
      INNER JOIN Mesocycle ms ON m.id = ms.macrocycle_id
     WHERE ms.id = p_mesocycle_id;

    IF (p_start_date IS NOT NULL AND p_start_date < v_macro_start) OR (p_end_date IS NOT NULL AND p_end_date > v_macro_end) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mesocycle dates must be within macrocycle dates';
    END IF;

    IF (
        (p_start_date IS NOT NULL AND p_end_date IS NOT NULL AND p_start_date > p_end_date) OR
        (p_start_date IS NOT NULL AND p_end_date IS NULL AND p_start_date > v_toUpdate_end) OR
        (p_end_date IS NOT NULL AND p_start_date IS NULL AND p_end_date < v_toUpdate_start)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start must be before end date';
    END IF;

    # Update the mesocycle
    UPDATE Mesocycle
    SET 
        cycle_name = COALESCE(p_name, cycle_name),
        cycle_start_date = COALESCE(p_start_date, cycle_start_date),
        cycle_end_date = COALESCE(p_end_date, cycle_end_date),
        opt_levels = COALESCE(p_opt_levels, opt_levels),
        cardio_levels = COALESCE(p_cardio_levels, cardio_levels),
        notes = COALESCE(p_notes, notes),
        is_active = COALESCE(p_is_active, is_active)
    WHERE id = p_mesocycle_id;

    # Update all overlapping active cycles in the same macrocycle as the updated record to inactive
    UPDATE Mesocycle ms
    INNER JOIN (
        SELECT 
            macrocycle_id,
            cycle_start_date,
            cycle_end_date
        FROM Mesocycle
        WHERE id = p_mesocycle_id
            AND is_active = TRUE
    ) AS updatedRecord ON ms.macrocycle_id = updatedRecord.macrocycle_id
    SET ms.is_active = FALSE
    WHERE ms.is_active = TRUE
        AND ms.id != p_mesocycle_id
        AND ms.cycle_end_date >= updatedRecord.cycle_start_date
        AND updatedRecord.cycle_end_date >= ms.cycle_start_date;
END