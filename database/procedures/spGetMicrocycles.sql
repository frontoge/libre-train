CREATE PROCEDURE spGetMicrocycles (
    IN p_client_id INT,
    IN p_mesocycle_id INT,
    IN p_active BOOLEAN,
    IN p_date DATE
)
BEGIN
    SELECT 
        id, 
        client_id, 
        cycle_name,
        mesocycle_id,
        cycle_start_date, 
        cycle_end_date, 
        notes, 
        is_active
    FROM Microcycle
    WHERE client_id = p_client_id
        AND (p_mesocycle_id IS NULL OR mesocycle_id = p_mesocycle_id)
        AND (p_active IS NULL OR is_active = p_active)
        AND (p_date IS NULL OR (cycle_start_date <= p_date AND cycle_end_date >= p_date));
END