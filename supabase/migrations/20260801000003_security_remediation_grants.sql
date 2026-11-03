-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000003_security_remediation_grants.sql
-- Description: Enforce principle of least privilege on PostgreSQL table
--              grants. Revoke TRUNCATE, TRIGGER, and REFERENCES from
--              anon and authenticated. Remove anon access to private tables.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Baseline revocation: Revoke dangerous administrative privileges from client roles
REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Ensure future tables don't automatically grant these
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLES FROM anon, authenticated;

-- 2. Revoke ALL privileges from 'anon' on sensitive/internal tables
REVOKE ALL ON TABLE public.students FROM anon;
REVOKE ALL ON TABLE public.student_applications FROM anon;
REVOKE ALL ON TABLE public.student_notes FROM anon;
REVOKE ALL ON TABLE public.partner_notifications FROM anon;
REVOKE ALL ON TABLE public.partner_notes FROM anon;
REVOKE ALL ON TABLE public.admin_notifications FROM anon;
REVOKE ALL ON TABLE public.admin_notification_reads FROM anon;
REVOKE ALL ON TABLE public.platform_settings FROM anon;
REVOKE ALL ON TABLE public.platform_tutorials FROM anon;
REVOKE ALL ON TABLE public.account_managers FROM anon;
REVOKE ALL ON TABLE public.user_roles FROM anon;
REVOKE ALL ON TABLE public.profiles FROM anon;

-- 3. Explicit grants for 'anon' role (Public operations only)
-- Read-only public marketing/catalog tables
GRANT SELECT ON TABLE public.countries TO anon;
GRANT SELECT ON TABLE public.universities TO anon;
GRANT SELECT ON TABLE public.courses TO anon;
GRANT SELECT ON TABLE public.accommodations TO anon;
GRANT SELECT ON TABLE public.scholarships TO anon;
GRANT SELECT ON TABLE public.language_centers TO anon;
GRANT SELECT ON TABLE public.blogs TO anon;
GRANT SELECT ON TABLE public.events TO anon;

-- Public form submission tables (INSERT only)
GRANT INSERT ON TABLE public.leads TO anon;
GRANT INSERT ON TABLE public.intake_reminders TO anon;
GRANT INSERT ON TABLE public.partner_registrations TO anon;

-- 4. Explicit grants for 'authenticated' role
-- (Actual row-level and column-level authorization is enforced by RLS and triggers)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.countries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.universities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.courses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.accommodations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scholarships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.language_centers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blogs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.intake_reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_registrations TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.student_applications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.student_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_notification_reads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_tutorials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.account_managers TO authenticated;

-- 5. Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

