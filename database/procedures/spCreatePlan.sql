CREATE PROCEDURE spCreatePlan(
	IN p_client_id INT,
	IN p_plan_label VARCHAR(128),
	IN p_parent_plan_id INT,
	IN p_plan_phase INT,
	IN p_start_date DATE,
	IN p_end_date DATE,
	IN p_is_active TINYINT(1),
	IN p_target_metric_id INT,
	IN p_target_value FLOAT
)
BEGIN
	INSERT INTO Plan (
		client_id,
		plan_label,
		parent_plan_id,
		plan_phase,
		start_date,
		end_date,
		is_active,
		target_metric_id,
		target_value
	) VALUES (
		p_client_id,
		p_plan_label,
		p_parent_plan_id,
		p_plan_phase,
		p_start_date,
		p_end_date,
		p_is_active,
		p_target_metric_id,
		p_target_value
	);
	SELECT LAST_INSERT_ID() AS plan_id;
END
