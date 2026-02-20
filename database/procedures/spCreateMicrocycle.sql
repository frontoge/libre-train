CREATE PROCEDURE spCreateMicrocycle (
    IN p_mesocycle_id INT,
    IN p_name VARCHAR(255),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_notes VARCHAR(512),
    IN p_is_active BOOLEAN
)
BEGIN
    DECLARE v_client_id INT;
    DECLARE v_meso_start DATE;
    DECLARE v_meso_end DATE;

    SELECT client_id, cycle_start_date, cycle_end_date
        INTO v_client_id, v_meso_start, v_meso_end
        FROM Mesocycle
    WHERE id = p_mesocycle_id;

    IF v_client_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mesocycle not found';
    END IF;

    IF p_start_date > p_end_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Start date must be before end date';
    END IF;

    IF p_start_date < v_meso_start OR p_end_date > v_meso_end THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Microcycle dates must be within mesocycle dates';
    END IF;

    IF p_is_active OR p_is_active IS NULL THEN
        UPDATE Microcycle
            SET is_active = FALSE
        WHERE mesocycle_id = p_mesocycle_id
            AND is_active = TRUE
            AND (
                (cycle_start_date <= p_end_date AND cycle_end_date >= p_start_date)
            );
    END IF;

    INSERT INTO Microcycle (
        mesocycle_id,
        client_id,
        cycle_name,
        cycle_start_date,
        cycle_end_date,
        notes,
        is_active
    ) VALUES (
        p_mesocycle_id,
        v_client_id,
        p_name,
        p_start_date,
        p_end_date,
        p_notes,
        p_is_active
    );
END