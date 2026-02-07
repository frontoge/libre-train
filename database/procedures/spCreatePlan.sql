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
	-- Insert the new plan
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

	-- Get the new plan's ID
	SET @new_plan_id = LAST_INSERT_ID();

	-- If a parent_plan_id was provided, update sibling plan phases
	IF p_parent_plan_id IS NOT NULL THEN
		UPDATE Plan
		SET plan_phase = plan_phase + 1
		WHERE parent_plan_id = p_parent_plan_id
		  AND id <> @new_plan_id
		  AND plan_phase >= p_plan_phase;
	END IF;

	-- Return the new plan's ID
	SELECT @new_plan_id AS plan_id;
END
