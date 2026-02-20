CREATE PROCEDURE spGetMesocycles (
    IN p_client_id INT,
    IN p_macrocycle_id INT,
    IN p_active BOOLEAN,
    IN p_date DATE
)
BEGIN
    SELECT 
        id, 
        client_id, 
        cycle_name,
        macrocycle_id,
        cycle_start_date, 
        cycle_end_date,
        opt_levels,
        cardio_levels,
        notes,
        is_active
    FROM Mesocycle
    WHERE client_id = p_client_id
        AND (p_macrocycle_id IS NULL OR macrocycle_id = p_macrocycle_id)
        AND (p_active IS NULL OR is_active = p_active)
        AND (p_date IS NULL OR (cycle_start_date <= p_date AND cycle_end_date >= p_date));
END