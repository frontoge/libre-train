CREATE PROCEDURE spGetClientContacts(
    IN p_client_id INT
)
BEGIN
    SELECT 
        c.id,
        ct.first_name,
        ct.last_name,
        ct.email,
        ct.phone,
        c.height,
        ct.date_of_birth,
        c.notes,
        c.created_at,
        c.updated_at
    FROM Client c
        JOIN Contact ct ON ct.id = c.contactId
    WHERE p_client_id IS NULL OR c.id = p_client_id;
END