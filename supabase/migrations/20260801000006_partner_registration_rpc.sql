-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000006_partner_registration_rpc.sql
-- Description: Robust partner registration function and RLS policies.
--              Ensures partner registrations can always be submitted 
--              and created safely without RLS or type mismatch errors.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure RLS INSERT policy exists for both anon and authenticated roles
DROP POLICY IF EXISTS "Public can submit partner registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Anyone can submit registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Anyone can submit partner registration" ON public.partner_registrations;

CREATE POLICY "Anyone can submit partner registration"
ON public.partner_registrations FOR INSERT
TO anon, authenticated
WITH CHECK (
  (status IS NULL OR status = 'pending') AND
  (admin_notes IS NULL OR trim(admin_notes) = '')
);

-- 2. Ensure SELECT policy allows users to view their own partner registration
DROP POLICY IF EXISTS "Users can view own partner registration" ON public.partner_registrations;
CREATE POLICY "Users can view own partner registration"
ON public.partner_registrations FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 3. Dedicated SECURITY DEFINER RPC to reliably register partner agency
CREATE OR REPLACE FUNCTION public.register_partner_agency(
  p_agency_name TEXT,
  p_contact_first_name TEXT,
  p_contact_last_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT '',
  p_country TEXT DEFAULT '',
  p_website_url TEXT DEFAULT '',
  p_annual_students TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id UUID;
  v_contact_person TEXT;
  v_annual_students_int INT := 0;
  v_reg_id UUID;
BEGIN
  -- 1. Identify the authenticated user calling this function
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    -- Try to match by email in auth.users if called right after signup
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE LOWER(email) = LOWER(p_email) 
    ORDER BY created_at DESC 
    LIMIT 1;
  END IF;

  -- 2. Build full contact name
  v_contact_person := TRIM(COALESCE(p_contact_first_name, '') || ' ' || COALESCE(p_contact_last_name, ''));
  IF v_contact_person = '' THEN
    v_contact_person := COALESCE(NULLIF(p_agency_name, ''), 'Partner Representative');
  END IF;

  -- 3. Parse annual students to integer safely
  BEGIN
    v_annual_students_int := NULLIF(regexp_replace(p_annual_students, '[^0-9]', '', 'g'), '')::INT;
  EXCEPTION WHEN OTHERS THEN
    v_annual_students_int := 0;
  END;
  IF v_annual_students_int IS NULL THEN
    v_annual_students_int := 0;
  END IF;

  -- 4. Check if registration already exists for this user_id or email
  IF v_user_id IS NOT NULL THEN
    SELECT id INTO v_reg_id FROM public.partner_registrations WHERE user_id = v_user_id LIMIT 1;
  END IF;
  
  IF v_reg_id IS NULL THEN
    SELECT id INTO v_reg_id FROM public.partner_registrations WHERE LOWER(email) = LOWER(p_email) LIMIT 1;
  END IF;

  IF v_reg_id IS NOT NULL THEN
    -- Update existing registration
    UPDATE public.partner_registrations
    SET
      user_id = COALESCE(v_user_id, user_id),
      agency_name = COALESCE(NULLIF(p_agency_name, ''), agency_name),
      contact_person = v_contact_person,
      contact_first_name = COALESCE(NULLIF(p_contact_first_name, ''), contact_first_name),
      contact_last_name = COALESCE(NULLIF(p_contact_last_name, ''), contact_last_name),
      email = p_email,
      phone = COALESCE(NULLIF(p_phone, ''), phone),
      country = COALESCE(NULLIF(p_country, ''), country),
      website_url = COALESCE(NULLIF(p_website_url, ''), website_url),
      annual_students = v_annual_students_int,
      status = 'pending',
      updated_at = NOW()
    WHERE id = v_reg_id;
  ELSE
    -- Insert new registration record
    INSERT INTO public.partner_registrations (
      user_id,
      agency_name,
      contact_person,
      contact_first_name,
      contact_last_name,
      email,
      phone,
      country,
      website_url,
      annual_students,
      status
    ) VALUES (
      v_user_id,
      COALESCE(NULLIF(p_agency_name, ''), 'Partner Agency'),
      v_contact_person,
      COALESCE(p_contact_first_name, ''),
      COALESCE(p_contact_last_name, ''),
      p_email,
      COALESCE(p_phone, ''),
      COALESCE(p_country, ''),
      COALESCE(p_website_url, ''),
      v_annual_students_int,
      'pending'
    ) RETURNING id INTO v_reg_id;
  END IF;

  -- 5. Automatically ensure user has the partner role in user_roles
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'partner'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'registration_id', v_reg_id,
    'status', 'pending'
  );
END;
$$;

-- Grant execution to anon and authenticated
GRANT EXECUTE ON FUNCTION public.register_partner_agency(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

