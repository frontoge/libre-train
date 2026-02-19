CREATE PROCEDURE spGetMacrocycles (
    IN p_client_id INT,
    IN p_active BOOLEAN,
    IN p_date DATE
)
BEGIN
    SELECT 
        id, 
        cycle_name, 
        client_id, 
        cycle_start_date, 
        cycle_end_date, 
        is_active, 
        notes
    FROM Macrocycle
    WHERE client_id = p_client_id
      AND (p_active IS NULL OR is_active = p_active)
      AND (p_date IS NULL OR (cycle_start_date <= p_date AND cycle_end_date >= p_date));
END