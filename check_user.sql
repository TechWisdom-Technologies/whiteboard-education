CREATE OR REPLACE FUNCTION check_user_exists(check_email text, check_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
  email_exists boolean := false;
  phone_exists boolean := false;
BEGIN
  -- Check profiles for email
  IF EXISTS (SELECT 1 FROM profiles WHERE email = check_email) THEN
    email_exists := true;
  END IF;
  
  -- Check partner_registrations for email
  IF EXISTS (SELECT 1 FROM partner_registrations WHERE email = check_email) THEN
    email_exists := true;
  END IF;
  
  -- Check partner_registrations for phone
  IF check_phone IS NOT NULL AND check_phone != '' AND EXISTS (SELECT 1 FROM partner_registrations WHERE phone = check_phone) THEN
    phone_exists := true;
  END IF;
  
  RETURN jsonb_build_object(
    'email_exists', email_exists,
    'phone_exists', phone_exists
  );
END;
$;
