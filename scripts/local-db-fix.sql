-- ================================================================
-- Whiteboard Education: FIX SCRIPT
-- ================================================================
-- Run this AFTER local-db-setup.sql if you got errors.
-- This fixes: has_role function + RLS policies with proper type cast.
-- Tables are already created, so this just patches what failed.
-- ================================================================

-- Step 1: Ensure user_roles table exists first (needed by has_role)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Step 2: Re-create has_role function (now user_roles exists)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 3: Drop and re-create all policies that use has_role
-- (with proper 'admin'::app_role cast)

-- Countries
DROP POLICY IF EXISTS "Admin manage countries" ON public.countries;
CREATE POLICY "Admin manage countries" ON public.countries
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Universities
DROP POLICY IF EXISTS "Admin manage universities" ON public.universities;
CREATE POLICY "Admin manage universities" ON public.universities
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Courses
DROP POLICY IF EXISTS "Admin manage courses" ON public.courses;
CREATE POLICY "Admin manage courses" ON public.courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Accommodations
DROP POLICY IF EXISTS "Admin manage accommodations" ON public.accommodations;
CREATE POLICY "Admin manage accommodations" ON public.accommodations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Scholarships
DROP POLICY IF EXISTS "Admin manage scholarships" ON public.scholarships;
CREATE POLICY "Admin manage scholarships" ON public.scholarships
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Language centers
DROP POLICY IF EXISTS "Admin manage language_centers" ON public.language_centers;
CREATE POLICY "Admin manage language_centers" ON public.language_centers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Blogs
DROP POLICY IF EXISTS "Admin manage blogs" ON public.blogs;
CREATE POLICY "Admin manage blogs" ON public.blogs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Events
DROP POLICY IF EXISTS "Admin manage events" ON public.events;
CREATE POLICY "Admin manage events" ON public.events
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Leads
DROP POLICY IF EXISTS "Admin manage leads" ON public.leads;
CREATE POLICY "Admin manage leads" ON public.leads
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Partner registrations
DROP POLICY IF EXISTS "Users can read own registration" ON public.partner_registrations;
DROP POLICY IF EXISTS "Admin manage registrations" ON public.partner_registrations;
CREATE POLICY "Users can read own registration" ON public.partner_registrations
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin manage registrations" ON public.partner_registrations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Students
DROP POLICY IF EXISTS "Partners can read own students" ON public.students;
DROP POLICY IF EXISTS "Admin manage students" ON public.students;
CREATE POLICY "Partners can read own students" ON public.students
  FOR SELECT USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admin manage students" ON public.students
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin notifications
DROP POLICY IF EXISTS "Admins can read admin notifications" ON public.admin_notifications;
CREATE POLICY "Admins can read admin notifications" ON public.admin_notifications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin notification reads
DROP POLICY IF EXISTS "Admins can view own notification reads" ON public.admin_notification_reads;
DROP POLICY IF EXISTS "Admins can insert own notification reads" ON public.admin_notification_reads;
DROP POLICY IF EXISTS "Admins can update own notification reads" ON public.admin_notification_reads;
CREATE POLICY "Admins can view own notification reads" ON public.admin_notification_reads
  FOR SELECT USING (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert own notification reads" ON public.admin_notification_reads
  FOR INSERT WITH CHECK (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update own notification reads" ON public.admin_notification_reads
  FOR UPDATE
  USING (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'::app_role));

-- ================================================================
-- SEED: Malaysia country entry
-- ================================================================
INSERT INTO public.countries (id, name, code, flag_icon, capital, currency, language, about_text)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Malaysia',
  'MY',
  'flag-my',
  'Kuala Lumpur',
  'Malaysian Ringgit (MYR)',
  'Malay, English',
  'Malaysia is a Southeast Asian country known for its affordable world-class education, multicultural environment, and modern infrastructure.'
)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- VERIFY: Check all tables exist
-- ================================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ================================================================
-- DONE! Fix complete.
-- Next: Run import scripts in order:
--   1. scripts/import-all-universities.sql
--   2. scripts/import-all-courses-part1.sql (through part4)
--   3. scripts/import-all-accommodations.sql
-- ================================================================
