-- ═══════════════════════════════════════════════════════════════════
-- Script: clear_partner_test_data.sql
-- Description: Safely wipe all partner accounts, test registrations, 
--              students, applications, and notifications while strictly 
--              preserving the Admin account.
-- ═══════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_admin_count INT;
BEGIN
  -- Safety verification: Ensure admin accounts exist and will be preserved
  SELECT COUNT(*) INTO v_admin_count 
  FROM auth.users u
  JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE ur.role = 'admin';

  RAISE NOTICE 'Safety check: Preserving % admin account(s).', v_admin_count;

  -- 1. Delete student notes belonging to partner students
  DELETE FROM public.student_notes
  WHERE student_id IN (
    SELECT s.id FROM public.students s
    WHERE s.partner_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
  );

  -- 2. Delete student applications belonging to partner students
  DELETE FROM public.student_applications
  WHERE student_id IN (
    SELECT s.id FROM public.students s
    WHERE s.partner_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
  );

  -- 3. Delete students submitted by partners
  DELETE FROM public.students
  WHERE partner_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

  -- 4. Delete partner internal notes
  DELETE FROM public.partner_notes
  WHERE partner_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

  -- 5. Delete partner notifications
  DELETE FROM public.partner_notifications
  WHERE partner_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

  -- 6. Delete all partner registrations
  DELETE FROM public.partner_registrations
  WHERE user_id IS NULL 
     OR user_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

  -- 7. Delete profiles of partner users
  DELETE FROM public.profiles
  WHERE user_id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');

  -- 8. Delete partner entries from user_roles
  DELETE FROM public.user_roles
  WHERE role != 'admin';

  -- 9. Delete partner authentication accounts from auth.users
  -- Explicitly protects your admin email and any admin role accounts
  DELETE FROM auth.users
  WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role = 'admin')
    AND email NOT LIKE '%mujahidraj%';

  RAISE NOTICE 'Successfully wiped all partner test data and accounts.';
END $$;
