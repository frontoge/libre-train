CREATE PROCEDURE spCreateMesocycle (
    IN p_macrocycle_id INT,
    IN p_name VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_opt_levels VARCHAR(255),
    IN p_cardio_levels VARCHAR(255),
    IN p_notes VARCHAR(512),
    IN p_is_active BOOLEAN
)
BEGIN
    # If the start and end date are not within the date range of parent macrocycle, throw an error

    # If the mesocycle is active, set all other active mesocycles in the same macrocycle that overlap as inactive

    # Insert the mesocycle and get the client_id from the parent macrocycle
    DECLARE v_client_id INT;
    DECLARE v_macro_start DATE;
    DECLARE v_macro_end DATE;

    -- Get macrocycle's client_id, start and end dates
    SELECT client_id, cycle_start_date, cycle_end_date
      INTO v_client_id, v_macro_start, v_macro_end
      FROM Macrocycle
     WHERE id = p_macrocycle_id;

    -- Check if macrocycle exists
    IF v_client_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Macrocycle not found';
    END IF;

    -- Check if dates are within macrocycle range
    IF p_start_date < v_macro_start OR p_end_date > v_macro_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mesocycle dates must be within macrocycle dates';
    END IF;

    -- If active, set overlapping active mesocycles in this macrocycle to inactive
    IF p_is_active THEN
        UPDATE Mesocycle
           SET is_active = FALSE
         WHERE macrocycle_id = p_macrocycle_id
           AND is_active = TRUE
           AND (
                (cycle_start_date <= p_end_date AND cycle_end_date >= p_start_date)
               );
    END IF;

    -- Insert new mesocycle
    INSERT INTO Mesocycle (
        client_id,
        cycle_name,
        macrocycle_id,
        cycle_start_date,
        cycle_end_date,
        opt_levels,
        cardio_levels,
        notes,
        is_active
    ) VALUES (
        v_client_id,
        p_name,
        p_macrocycle_id,
        p_start_date,
        p_end_date,
        p_opt_levels,
        p_cardio_levels,
        p_notes,
        p_is_active
    );
END