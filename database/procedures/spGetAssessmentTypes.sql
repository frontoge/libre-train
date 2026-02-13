CREATE PROCEDURE spGetAssessmentTypes (
    IN p_id INT UNSIGNED
)
BEGIN
    SELECT *
    FROM AssessmentType
    WHERE p_id IS NULL OR id = p_id;
END;