-- Migration: Add account_manager_id to partner_registrations
-- Allows assigning a specific account manager to each partner agency.

-- 1. Add account_manager_id foreign key column to partner_registrations
ALTER TABLE public.partner_registrations
ADD COLUMN IF NOT EXISTS account_manager_id UUID REFERENCES public.account_managers(id) ON DELETE SET NULL;

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_partner_registrations_account_manager_id 
ON public.partner_registrations(account_manager_id);

-- 3. Update protect_partner_registration_fields to ensure partners cannot modify account_manager_id themselves
CREATE OR REPLACE FUNCTION public.protect_partner_registration_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Admins can update any registration field
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Disallow self-approval or status change
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Partners cannot modify registration approval status.';
  END IF;

  -- Disallow modifying admin notes
  IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
    RAISE EXCEPTION 'Partners cannot modify administrative internal notes.';
  END IF;

  -- Disallow modifying assigned account manager
  IF NEW.account_manager_id IS DISTINCT FROM OLD.account_manager_id THEN
    RAISE EXCEPTION 'Partners cannot modify assigned account manager.';
  END IF;

  -- Disallow transferring registration ownership
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Partners cannot reassign registration ownership.';
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';

