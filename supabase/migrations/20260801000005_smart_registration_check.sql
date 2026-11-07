-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000005_smart_registration_check.sql
-- Description: Update check_registration_exists RPC so unconfirmed 
--              users who never completed verification are not blocked 
--              from registering or receiving a new OTP.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_registration_exists(check_email TEXT, check_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_email_exists BOOLEAN := FALSE;
  v_phone_exists BOOLEAN := FALSE;
BEGIN
  -- Only consider email as registered if it is CONFIRMED and has a partner registration
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN public.partner_registrations pr ON pr.user_id = u.id
    WHERE LOWER(u.email) = LOWER(check_email)
      AND u.email_confirmed_at IS NOT NULL
  ) INTO v_email_exists;

  -- Check phone in active partner_registrations
  SELECT EXISTS (
    SELECT 1 
    FROM public.partner_registrations pr
    JOIN auth.users u ON u.id = pr.user_id
    WHERE pr.phone = check_phone
      AND u.email_confirmed_at IS NOT NULL
  ) INTO v_phone_exists;

  RETURN jsonb_build_object(
    'email_exists', v_email_exists,
    'phone_exists', v_phone_exists
  );
END;
$$;

-- Grant execution to public/anon for registration form
GRANT EXECUTE ON FUNCTION public.check_registration_exists(TEXT, TEXT) TO anon, authenticated;

