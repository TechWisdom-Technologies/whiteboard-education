-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000007_cascade_partner_deletion.sql
-- Description: Complete partner removal system.
--              Ensures that when a partner is deleted (via Admin Panel
--              or direct SQL/Table Editor), their auth.users account,
--              user_roles, and notifications are completely purged.
--              Prevents orphaned zombie logins.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Trigger function: Auto-purge auth.users when a partner_registrations row is deleted
CREATE OR REPLACE FUNCTION public.handle_partner_registration_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF OLD.user_id IS NOT NULL THEN
    -- Safety check: NEVER delete an administrator account
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = OLD.user_id AND role = 'admin'
    ) THEN
      -- Delete dependent rows first to prevent FK blocks
      DELETE FROM public.partner_notifications WHERE partner_id = OLD.user_id;
      DELETE FROM public.user_roles WHERE user_id = OLD.user_id;
      
      -- Delete from auth.users (cascades auth identities, sessions, etc.)
      DELETE FROM auth.users WHERE id = OLD.user_id;
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_delete_partner_auth_user ON public.partner_registrations;
CREATE TRIGGER trg_delete_partner_auth_user
AFTER DELETE ON public.partner_registrations
FOR EACH ROW
EXECUTE FUNCTION public.handle_partner_registration_deletion();

-- 2. Dedicated RPC for Admin Panel to cleanly delete a partner and their auth user
CREATE OR REPLACE FUNCTION public.admin_delete_partner(p_partner_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Security check: Must be an administrator
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only administrators can delete partner accounts.';
  END IF;

  -- Locate user_id and email from the registration
  SELECT user_id, email INTO v_user_id, v_email 
  FROM public.partner_registrations 
  WHERE id = p_partner_id;

  -- Delete partner registration row (will also trigger trg_delete_partner_auth_user)
  DELETE FROM public.partner_registrations WHERE id = p_partner_id;

  -- Direct purge fallback if user_id was found or matched by email
  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = v_user_id AND role = 'admin'
    ) THEN
      DELETE FROM public.partner_notifications WHERE partner_id = v_user_id;
      DELETE FROM public.user_roles WHERE user_id = v_user_id;
      DELETE FROM auth.users WHERE id = v_user_id;
    END IF;
  ELSIF v_email IS NOT NULL THEN
    DELETE FROM auth.users 
    WHERE LOWER(email) = LOWER(v_email)
      AND id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_partner(UUID) TO authenticated;

-- 3. Cleanup query: purge any orphaned users who have no registration and no admin role
DELETE FROM auth.users
WHERE id NOT IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
)
AND id NOT IN (
  SELECT user_id FROM public.partner_registrations WHERE user_id IS NOT NULL
);

