CREATE PROCEDURE spGetClientPlans(
    IN p_client_id INT
)
BEGIN
    SELECT 
        p.id,
        p.plan_label,
        p.parent_plan_id,
        p.plan_phase,
        p.start_date,
        p.end_date,
        p.is_active,
        p.target_metric_id,
        p.target_value,
        p.created_at
    FROM Plan p
    WHERE p.client_id = p_client_id;
END