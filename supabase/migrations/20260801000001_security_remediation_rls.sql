-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000001_security_remediation_rls.sql
-- Description: Robust, scoped Row Level Security policies replacing
--              open/broad authenticated policies across all tables.
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────
-- 1. Table: student_applications
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- Drop legacy/broad policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.student_applications;
DROP POLICY IF EXISTS "Anyone can read student_applications" ON public.student_applications;
DROP POLICY IF EXISTS "Users can read student_applications" ON public.student_applications;
DROP POLICY IF EXISTS "Admins can manage student_applications" ON public.student_applications;
DROP POLICY IF EXISTS "Approved partners can view own student applications" ON public.student_applications;
DROP POLICY IF EXISTS "Approved partners can insert own student applications" ON public.student_applications;

-- Admin: full management access
CREATE POLICY "Admins can manage student_applications"
ON public.student_applications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approved Partners: view applications for their own students
CREATE POLICY "Approved partners can view own student applications"
ON public.student_applications FOR SELECT TO authenticated
USING (
  public.is_approved_partner(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_applications.student_id
      AND s.partner_id = auth.uid()
  )
);

-- Approved Partners: insert applications for their own students
CREATE POLICY "Approved partners can insert own student applications"
ON public.student_applications FOR INSERT TO authenticated
WITH CHECK (
  public.is_approved_partner(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_applications.student_id
      AND s.partner_id = auth.uid()
  )
);

-- ───────────────────────────────────────────────────────────────────
-- 2. Table: students
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop obsolete/broad policies
DROP POLICY IF EXISTS "Partners can view own students" ON public.students;
DROP POLICY IF EXISTS "Partners can insert own students" ON public.students;
DROP POLICY IF EXISTS "Partners can update own students" ON public.students;
DROP POLICY IF EXISTS "Admins can manage students" ON public.students;
DROP POLICY IF EXISTS "Admin manage students" ON public.students;
DROP POLICY IF EXISTS "Approved partners can view own students" ON public.students;
DROP POLICY IF EXISTS "Approved partners can insert own students" ON public.students;
DROP POLICY IF EXISTS "Approved partners can update own students" ON public.students;

-- Admin: full access
CREATE POLICY "Admins can manage students"
ON public.students FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approved Partners: view own students
CREATE POLICY "Approved partners can view own students"
ON public.students FOR SELECT TO authenticated
USING (
  public.is_approved_partner(auth.uid()) AND partner_id = auth.uid()
);

-- Approved Partners: insert own students (status defaults to 'new')
CREATE POLICY "Approved partners can insert own students"
ON public.students FOR INSERT TO authenticated
WITH CHECK (
  public.is_approved_partner(auth.uid()) AND
  partner_id = auth.uid() AND
  (status IS NULL OR status = 'new') AND
  (admin_notes IS NULL OR trim(admin_notes) = '')
);

-- Approved Partners: update own students (admin fields protected via trigger)
CREATE POLICY "Approved partners can update own students"
ON public.students FOR UPDATE TO authenticated
USING (
  public.is_approved_partner(auth.uid()) AND partner_id = auth.uid()
)
WITH CHECK (
  public.is_approved_partner(auth.uid()) AND partner_id = auth.uid()
);

-- ───────────────────────────────────────────────────────────────────
-- 3. Table: student_notes
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

-- Drop obsolete/broad policies
DROP POLICY IF EXISTS "Anyone can read student_notes" ON public.student_notes;
DROP POLICY IF EXISTS "Users can read student_notes" ON public.student_notes;
DROP POLICY IF EXISTS "Users can insert student_notes" ON public.student_notes;
DROP POLICY IF EXISTS "Admins can manage student_notes" ON public.student_notes;
DROP POLICY IF EXISTS "Approved partners can view own student notes" ON public.student_notes;
DROP POLICY IF EXISTS "Approved partners can insert own student notes" ON public.student_notes;

-- Admin: full access across all student notes
CREATE POLICY "Admins can manage student_notes"
ON public.student_notes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approved Partners: read notes strictly for their own students
CREATE POLICY "Approved partners can view own student notes"
ON public.student_notes FOR SELECT TO authenticated
USING (
  public.is_approved_partner(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_notes.student_id
      AND s.partner_id = auth.uid()
  )
);

-- Approved Partners: send notes strictly for their own students
CREATE POLICY "Approved partners can insert own student notes"
ON public.student_notes FOR INSERT TO authenticated
WITH CHECK (
  public.is_approved_partner(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_notes.student_id
      AND s.partner_id = auth.uid()
  )
);

-- ───────────────────────────────────────────────────────────────────
-- 4. Table: partner_registrations
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.partner_registrations ENABLE ROW LEVEL SECURITY;

-- Drop obsolete policies
DROP POLICY IF EXISTS "Anyone can submit registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Users can read own registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Users can update own registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Admin manage registrations" ON public.partner_registrations;
DROP POLICY IF EXISTS "Admins can manage partner registrations" ON public.partner_registrations;
DROP POLICY IF EXISTS "Public can submit partner registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Users can view own partner registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Partners can update own registration profile" ON public.partner_registrations;

-- Public registration submission (must be 'pending')
CREATE POLICY "Public can submit partner registration"
ON public.partner_registrations FOR INSERT
WITH CHECK (
  (status IS NULL OR status = 'pending') AND
  (admin_notes IS NULL OR trim(admin_notes) = '')
);

-- Users can read their own registration row
CREATE POLICY "Users can view own partner registration"
ON public.partner_registrations FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Partners can update their permitted profile fields (trigger prevents status/admin_notes alteration)
CREATE POLICY "Partners can update own registration profile"
ON public.partner_registrations FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins retain full management capability
CREATE POLICY "Admins can manage partner registrations"
ON public.partner_registrations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ───────────────────────────────────────────────────────────────────
-- 5. Table: partner_notifications
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

-- Drop obsolete policies
DROP POLICY IF EXISTS "Partners can read own notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Partners can update own notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Admins can manage partner notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Approved partners can view own notifications" ON public.partner_notifications;
DROP POLICY IF EXISTS "Approved partners can update read state on own notifications" ON public.partner_notifications;

-- Admins can manage all partner notifications
CREATE POLICY "Admins can manage partner notifications"
ON public.partner_notifications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approved Partners: read own notifications
CREATE POLICY "Approved partners can view own notifications"
ON public.partner_notifications FOR SELECT TO authenticated
USING (
  public.is_approved_partner(auth.uid()) AND partner_id = auth.uid()
);

-- Approved Partners: update read state only (trigger enforces column restriction)
CREATE POLICY "Approved partners can update read state on own notifications"
ON public.partner_notifications FOR UPDATE TO authenticated
USING (
  public.is_approved_partner(auth.uid()) AND partner_id = auth.uid()
)
WITH CHECK (
  public.is_approved_partner(auth.uid()) AND partner_id = auth.uid()
);

-- ───────────────────────────────────────────────────────────────────
-- 6. Table: partner_notes (Admin internal communication only)
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.partner_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read partner_notes" ON public.partner_notes;
DROP POLICY IF EXISTS "Users can read partner_notes" ON public.partner_notes;
DROP POLICY IF EXISTS "Admins can manage partner_notes" ON public.partner_notes;

-- Strictly admin-only
CREATE POLICY "Admins can manage partner_notes"
ON public.partner_notes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ───────────────────────────────────────────────────────────────────
-- 7. Table: platform_settings
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop broad policies
DROP POLICY IF EXISTS "Anyone can read platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can insert platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can update platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can delete platform_settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Admins can manage platform_settings" ON public.platform_settings;

-- Strictly admin-only
CREATE POLICY "Admins can manage platform_settings"
ON public.platform_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ───────────────────────────────────────────────────────────────────
-- 8. Table: platform_tutorials
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.platform_tutorials ENABLE ROW LEVEL SECURITY;

-- Drop broad policies
DROP POLICY IF EXISTS "Anyone can read platform_tutorials" ON public.platform_tutorials;
DROP POLICY IF EXISTS "Admins can insert platform_tutorials" ON public.platform_tutorials;
DROP POLICY IF EXISTS "Admins can update platform_tutorials" ON public.platform_tutorials;
DROP POLICY IF EXISTS "Admins can delete platform_tutorials" ON public.platform_tutorials;
DROP POLICY IF EXISTS "Admins can manage platform_tutorials" ON public.platform_tutorials;
DROP POLICY IF EXISTS "Approved partners can view active platform_tutorials" ON public.platform_tutorials;

-- Admin: full management
CREATE POLICY "Admins can manage platform_tutorials"
ON public.platform_tutorials FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approved Partners: view active tutorials
CREATE POLICY "Approved partners can view active platform_tutorials"
ON public.platform_tutorials FOR SELECT TO authenticated
USING (
  public.is_approved_partner(auth.uid()) AND is_active = true
);

-- ───────────────────────────────────────────────────────────────────
-- 9. Table: account_managers
-- ───────────────────────────────────────────────────────────────────
ALTER TABLE public.account_managers ENABLE ROW LEVEL SECURITY;

-- Drop broad policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.account_managers;
DROP POLICY IF EXISTS "Enable all access for authenticated admins" ON public.account_managers;
DROP POLICY IF EXISTS "Admins can manage account_managers" ON public.account_managers;
DROP POLICY IF EXISTS "Approved partners can view account_managers" ON public.account_managers;

-- Admin: full access
CREATE POLICY "Admins can manage account_managers"
ON public.account_managers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Approved Partners: view account managers
CREATE POLICY "Approved partners can view account_managers"
ON public.account_managers FOR SELECT TO authenticated
USING (
  public.is_approved_partner(auth.uid())
);

