CREATE PROCEDURE spGetClientContacts(
    IN p_client_id INT
)
BEGIN
    SELECT 
        cc.ClientId as id,
        cc.ContactId as contact_id,
        cc.trainerId,
        cc.first_name,
        cc.last_name,
        cc.email,
        cc.phone,
        cc.height,
        cc.date_of_birth,
        cc.notes,
        cc.img
    FROM ClientContact cc
    WHERE p_client_id IS NULL OR cc.ClientId = p_client_id;
END