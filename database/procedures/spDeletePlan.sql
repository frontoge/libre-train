CREATE PROCEDURE spDeletePlan(
    IN p_plan_id INT
)
BEGIN
    DELETE FROM Plan WHERE id = p_plan_id;
END