CREATE PROCEDURE spGetAssessmentClientLog (
    IN p_client_id INT UNSIGNED,
    IN p_group_id INT UNSIGNED,
    IN p_type_id INT UNSIGNED,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_page INT,
    IN p_page_size INT
)
BEGIN 
    DECLARE v_offset INT;
    DECLARE v_page INT;
    DECLARE v_page_size INT;

    SET v_page = IFNULL(NULLIF(p_page, 0), 1);
    SET v_page_size = IFNULL(NULLIF(p_page_size, 0), 20);
    SET v_offset = v_page_size * (v_page - 1);

    SELECT
        acl.*
    FROM AssessmentClientLog acl
    JOIN AssessmentType ast ON ast.id = acl.assessmentTypeId
    WHERE 
        acl.clientId = p_client_id
        AND (p_group_id IS NULL OR ast.assessmentGroupId = p_group_id)
        AND (p_type_id IS NULL OR acl.assessmentTypeId = p_type_id)
        AND (p_start_date IS NULL OR acl.assessmentDate >= p_start_date)
        AND (p_end_date IS NULL OR acl.assessmentDate <= p_end_date)
    LIMIT v_offset, v_page_size;
END;