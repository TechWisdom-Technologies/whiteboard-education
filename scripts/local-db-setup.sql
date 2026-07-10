-- ================================================================
-- Whiteboard Education: LOCAL PostgreSQL Database Setup
-- ================================================================
-- Run this script ONCE on your local PostgreSQL instance.
-- This replaces Supabase's auth.users with a local users table
-- and sets up all tables, functions, triggers, and policies.
--
-- HOW TO USE:
--   1. Open DBeaver → Connect to localhost PostgreSQL
--   2. Right-click your database → SQL Editor
--   3. Paste this entire file and execute (Ctrl+Enter or F5)
-- ================================================================

-- ================================================================
-- EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- SCHEMA: Simulate Supabase's auth schema locally
-- ================================================================
CREATE SCHEMA IF NOT EXISTS auth;

-- Local users table (replaces auth.users from Supabase)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT DEFAULT '',
  raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Simulate auth.uid() function for RLS policies
-- In local mode: SET app.current_user_id = '<uuid>';
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::UUID
$$;

-- ================================================================
-- ENUMS
-- ================================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ================================================================
-- TABLE: user_roles
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ================================================================
-- TABLE: profiles
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: countries
-- ================================================================
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  flag_icon TEXT DEFAULT '',
  banner_image TEXT DEFAULT '',
  capital TEXT DEFAULT '',
  currency TEXT DEFAULT '',
  language TEXT DEFAULT '',
  population TEXT DEFAULT '',
  about_text TEXT DEFAULT '',
  reasons_to_study JSONB DEFAULT '[]'::jsonb,
  cost_of_living JSONB DEFAULT '{}'::jsonb,
  post_study_work_rights TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_countries_updated_at ON public.countries;
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: universities
-- ================================================================
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  city TEXT NOT NULL DEFAULT '',
  logo_url TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  ranking INTEGER DEFAULT 0,
  global_score NUMERIC DEFAULT 0,
  about_text TEXT DEFAULT '',
  study_reasons JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  registration_steps JSONB DEFAULT '[]'::jsonb,
  total_students INTEGER DEFAULT 0,
  international_ratio INTEGER DEFAULT 0,
  established INTEGER DEFAULT 0,
  campus_size TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_universities_updated_at ON public.universities;
CREATE TRIGGER update_universities_updated_at
  BEFORE UPDATE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: courses
-- ================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  degree_level TEXT NOT NULL DEFAULT 'Bachelor',
  tuition_fee NUMERIC NOT NULL DEFAULT 0,
  duration TEXT DEFAULT '',
  intake_months JSONB DEFAULT '[]'::jsonb,
  overview TEXT DEFAULT '',
  curriculum JSONB DEFAULT '[]'::jsonb,
  entry_requirements JSONB DEFAULT '{}'::jsonb,
  career_outcomes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: accommodations
-- ================================================================
CREATE TABLE IF NOT EXISTS public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'Apartment',
  price_per_month NUMERIC NOT NULL DEFAULT 0,
  amenities JSONB DEFAULT '[]'::jsonb,
  near_university_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_accommodations_updated_at ON public.accommodations;
CREATE TRIGGER update_accommodations_updated_at
  BEFORE UPDATE ON public.accommodations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: scholarships
-- ================================================================
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  coverage_amount TEXT NOT NULL DEFAULT '',
  criteria TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_scholarships_updated_at ON public.scholarships;
CREATE TRIGGER update_scholarships_updated_at
  BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: language_centers
-- ================================================================
CREATE TABLE IF NOT EXISTS public.language_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institute TEXT DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  duration TEXT DEFAULT '',
  tuition_fee NUMERIC NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Beginner',
  overview TEXT DEFAULT '',
  curriculum JSONB DEFAULT '[]'::jsonb,
  intake_months JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_language_centers_updated_at ON public.language_centers;
CREATE TRIGGER update_language_centers_updated_at
  BEFORE UPDATE ON public.language_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: blogs
-- ================================================================
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  author TEXT DEFAULT '',
  date DATE DEFAULT CURRENT_DATE,
  image TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  category TEXT DEFAULT '',
  read_time TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: events
-- ================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Open Day',
  date TEXT DEFAULT '',
  time TEXT DEFAULT '',
  university_ids JSONB DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  spots_left INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: partner_registrations
-- ================================================================
CREATE TABLE IF NOT EXISTS public.partner_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  annual_students INTEGER DEFAULT 0,
  phone TEXT DEFAULT '',
  nid_document_url TEXT DEFAULT '',
  trade_license_url TEXT DEFAULT '',
  certificate_urls JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_partner_registrations_updated_at ON public.partner_registrations;
CREATE TRIGGER update_partner_registrations_updated_at
  BEFORE UPDATE ON public.partner_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: students
-- ================================================================
CREATE TABLE IF NOT EXISTS public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  passport_number TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  date_of_birth DATE,
  gender TEXT DEFAULT '',
  previous_institution TEXT DEFAULT '',
  previous_degree TEXT DEFAULT '',
  gpa NUMERIC DEFAULT 0,
  ielts_score NUMERIC DEFAULT 0,
  target_university TEXT DEFAULT '',
  target_course TEXT DEFAULT '',
  intake_month TEXT DEFAULT '',
  degree_level TEXT DEFAULT 'Bachelor',
  status TEXT NOT NULL DEFAULT 'document_review',
  admin_notes TEXT DEFAULT '',
  passport_url TEXT DEFAULT '',
  academic_transcript_url TEXT DEFAULT '',
  ielts_certificate_url TEXT DEFAULT '',
  personal_statement_url TEXT DEFAULT '',
  recommendation_letter_url TEXT DEFAULT '',
  other_documents JSONB DEFAULT '[]'::jsonb,
  nid_number TEXT DEFAULT '',
  major TEXT DEFAULT '',
  language_test_name TEXT DEFAULT '',
  passport_photo TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: leads
-- ================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  interested_course TEXT DEFAULT '',
  interested_university TEXT DEFAULT '',
  message TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- TABLE: intake_reminders
-- ================================================================
CREATE TABLE IF NOT EXISTS public.intake_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  university_name TEXT DEFAULT '',
  intake_label TEXT DEFAULT '',
  deadline_date TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- TABLE: admin_notifications
-- ================================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  href TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_table, source_id, event_type)
);

-- ================================================================
-- TABLE: admin_notification_reads
-- ================================================================
CREATE TABLE IF NOT EXISTS public.admin_notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_key TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (admin_user_id, notification_key)
);

DROP TRIGGER IF EXISTS update_admin_notif_reads_updated_at ON public.admin_notification_reads;
CREATE TRIGGER update_admin_notif_reads_updated_at
  BEFORE UPDATE ON public.admin_notification_reads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================================
-- NOTIFICATION TRIGGERS
-- ================================================================

CREATE OR REPLACE FUNCTION public.cascade_delete_notifications()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.admin_notifications
  WHERE source_id = OLD.id::text AND source_table = TG_TABLE_NAME;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cascade_delete_students ON public.students;
CREATE TRIGGER trg_cascade_delete_students
  BEFORE DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_notifications();

DROP TRIGGER IF EXISTS trg_cascade_delete_leads ON public.leads;
CREATE TRIGGER trg_cascade_delete_leads
  BEFORE DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_notifications();

DROP TRIGGER IF EXISTS trg_cascade_delete_partners ON public.partner_registrations;
CREATE TRIGGER trg_cascade_delete_partners
  BEFORE DELETE ON public.partner_registrations
  FOR EACH ROW EXECUTE FUNCTION public.cascade_delete_notifications();

CREATE OR REPLACE FUNCTION public.notify_admin_new_lead()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'new' THEN
    INSERT INTO public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    VALUES ('leads', NEW.id::text, 'lead_created', 'New Lead',
      COALESCE(NEW.full_name, NEW.email, 'Unknown') || ' submitted an inquiry',
      '/admin/leads', jsonb_build_object('leadId', NEW.id, 'email', NEW.email))
    ON CONFLICT (source_table, source_id, event_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notify_new_lead ON public.leads;
CREATE TRIGGER trg_admin_notify_new_lead
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_lead();

CREATE OR REPLACE FUNCTION public.notify_admin_partner_pending()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    INSERT INTO public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    VALUES ('partner_registrations', NEW.id::text, 'partner_pending', 'Partner Approval Pending',
      COALESCE(NEW.agency_name, 'Agency') || ' is waiting for approval',
      '/admin/partners', jsonb_build_object('registrationId', NEW.id))
    ON CONFLICT (source_table, source_id, event_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notify_partner_pending ON public.partner_registrations;
CREATE TRIGGER trg_admin_notify_partner_pending
  AFTER INSERT OR UPDATE ON public.partner_registrations
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_partner_pending();

CREATE OR REPLACE FUNCTION public.notify_admin_student_doc_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'document_review' AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    VALUES ('students', NEW.id::text, 'student_document_review', 'Student in Document Review',
      COALESCE(NEW.full_name, 'Student') || ' needs review',
      '/admin/students', jsonb_build_object('studentId', NEW.id))
    ON CONFLICT (source_table, source_id, event_type) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_notify_student_doc_review ON public.students;
CREATE TRIGGER trg_admin_notify_student_doc_review
  AFTER INSERT OR UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_student_doc_review();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notification_reads ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read countries" ON public.countries FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read universities" ON public.universities FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read accommodations" ON public.accommodations FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read scholarships" ON public.scholarships FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read language_centers" ON public.language_centers FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Public read events" ON public.events FOR SELECT TO PUBLIC USING (true);

-- Admin manage policies
CREATE POLICY "Admin manage countries" ON public.countries FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage universities" ON public.universities FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage accommodations" ON public.accommodations FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage scholarships" ON public.scholarships FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage language_centers" ON public.language_centers FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage blogs" ON public.blogs FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Leads
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage leads" ON public.leads FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Intake reminders
CREATE POLICY "Anyone can subscribe to reminders" ON public.intake_reminders FOR INSERT WITH CHECK (true);

-- Partner registrations
CREATE POLICY "Anyone can submit registration" ON public.partner_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own registration" ON public.partner_registrations FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own registration" ON public.partner_registrations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manage registrations" ON public.partner_registrations FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Students
CREATE POLICY "Partners can read own students" ON public.students FOR SELECT USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can insert students" ON public.students FOR INSERT WITH CHECK (partner_id = auth.uid());
CREATE POLICY "Partners can update own students" ON public.students FOR UPDATE USING (partner_id = auth.uid());
CREATE POLICY "Partners can delete own students" ON public.students FOR DELETE USING (partner_id = auth.uid());
CREATE POLICY "Admin manage students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin notifications
CREATE POLICY "Admins can read admin notifications" ON public.admin_notifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view own notification reads" ON public.admin_notification_reads FOR SELECT USING (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert own notification reads" ON public.admin_notification_reads FOR INSERT WITH CHECK (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update own notification reads" ON public.admin_notification_reads FOR UPDATE USING (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin')) WITH CHECK (admin_user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- ================================================================
-- SEED: Malaysia country entry
-- (Matches hardcoded UUID in import-all-universities.sql)
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
-- DONE! All tables created successfully.
-- Next: Run the data import scripts in this order:
--   1. scripts/import-all-universities.sql
--   2. scripts/import-all-courses-part1.sql
--   3. scripts/import-all-courses-part2.sql
--   4. scripts/import-all-courses-part3.sql
--   5. scripts/import-all-courses-part4.sql
--   6. scripts/import-all-accommodations.sql
-- ================================================================
