CREATE PROCEDURE spCreateAssessmentClientLog (
    IN p_client_id INT UNSIGNED,
    IN p_assessment_type_id INT UNSIGNED,
    IN p_assessment_value VARCHAR(500),
    IN p_assessment_date DATE
)
BEGIN
    INSERT INTO AssessmentClientLog (clientId, assessmentTypeId, assessmentValue, assessmentDate)
    VALUES (p_client_id, p_assessment_type_id, p_assessment_value, IFNULL(p_assessment_date, CURDATE()));
END;