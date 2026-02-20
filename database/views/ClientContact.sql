CREATE VIEW ClientContact AS
SELECT 
  cl.id as ClientId,
  c.id as ContactId,
  c.first_name as first_name,
  c.last_name as last_name,
  c.email as email,
  c.phone as phone,
  c.date_of_birth as date_of_birth,
  cl.height as height,
  cl.trainerId as trainerId,
  c.img as img,
  cl.notes as notes  
FROM Client cl
JOIN Contact c ON c.id = cl.contactId;
