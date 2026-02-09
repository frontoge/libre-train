CREATE PROCEDURE spUpdateAssessmentClientLog(
	IN p_id INT,
	IN p_clientId INT,
    IN p_assessmentTypeId INT,
    IN p_assessmentValue VARCHAR(500),
    IN p_assessmentDate DATE
)
BEGIN
	UPDATE AssessmentClientLog
	SET
		clientId = COALESCE(p_clientId, clientId),
		assessmentTypeId = COALESCE(p_assessmentTypeId, assessmentTypeId),
		assessmentValue = COALESCE(p_assessmentValue, assessmentValue),
		assessmentDate = COALESCE(p_assessmentDate, assessmentDate)
    WHERE id = p_id;
END;
