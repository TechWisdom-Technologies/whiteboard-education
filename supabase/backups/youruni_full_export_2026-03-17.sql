-- ================================================================
-- YourUni COMPLETE Database Export
-- Generated: 2026-03-17T10:53:15.182Z
-- Source: Supabase PostgreSQL Database
-- 
-- INSTRUCTIONS:
-- 1. Create a fresh Supabase project
-- 2. Go to SQL Editor
-- 3. Paste this ENTIRE file and run it
-- 4. Set up your Edge Functions separately
-- 5. Create auth users manually (passwords cannot be exported)
-- ================================================================


-- =====================
-- 1. EXTENSIONS
-- =====================
-- These are typically enabled by default in Supabase:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- 2. CUSTOM ENUM TYPES
-- =====================
DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END
$$;

-- =====================
-- 3. UTILITY FUNCTIONS
-- =====================

-- Functions are created after table definitions so fresh-project imports do not fail
-- on references to tables that do not exist yet.

-- =====================
-- 4. TABLE DEFINITIONS
-- =====================

-- 4.1 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  display_name text,
  avatar_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.2 user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4.3 countries
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  capital text DEFAULT '',
  currency text DEFAULT '',
  language text DEFAULT '',
  population text DEFAULT '',
  flag_icon text DEFAULT '',
  banner_image text DEFAULT '',
  about_text text DEFAULT '',
  post_study_work_rights text DEFAULT '',
  reasons_to_study jsonb DEFAULT '[]',
  cost_of_living jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.4 universities
CREATE TABLE IF NOT EXISTS public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL DEFAULT '',
  country_id uuid REFERENCES public.countries(id),
  description text DEFAULT '',
  about_text text DEFAULT '',
  hero_image text DEFAULT '',
  logo_url text DEFAULT '',
  ranking integer DEFAULT 0,
  established integer DEFAULT 0,
  total_students integer DEFAULT 0,
  international_ratio integer DEFAULT 0,
  global_score numeric DEFAULT 0,
  campus_size text DEFAULT '',
  latitude double precision,
  longitude double precision,
  study_reasons jsonb DEFAULT '[]',
  faqs jsonb DEFAULT '[]',
  registration_steps jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.5 courses
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  degree_level text NOT NULL DEFAULT 'Bachelor',
  duration text DEFAULT '',
  tuition_fee numeric NOT NULL DEFAULT 0,
  overview text DEFAULT '',
  university_id uuid REFERENCES public.universities(id),
  intake_months jsonb DEFAULT '[]',
  curriculum jsonb DEFAULT '[]',
  entry_requirements jsonb DEFAULT '{}',
  career_outcomes jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.6 accommodations
CREATE TABLE IF NOT EXISTS public.accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'Apartment',
  property_type text NOT NULL DEFAULT 'Residential',
  price_per_month numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  image_url text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  travel_distance text DEFAULT '',
  latitude double precision,
  longitude double precision,
  amenities jsonb DEFAULT '[]',
  room_types jsonb DEFAULT '[]',
  unit_types jsonb DEFAULT '[]',
  near_university_ids jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.7 scholarships
CREATE TABLE IF NOT EXISTS public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coverage_amount text NOT NULL DEFAULT '',
  criteria text DEFAULT '',
  university_id uuid REFERENCES public.universities(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.8 language_centers
CREATE TABLE IF NOT EXISTS public.language_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'Beginner',
  duration text DEFAULT '',
  tuition_fee numeric NOT NULL DEFAULT 0,
  overview text DEFAULT '',
  institute text DEFAULT '',
  curriculum jsonb DEFAULT '[]',
  intake_months jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.9 blogs
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  author text DEFAULT '',
  category text DEFAULT '',
  image text DEFAULT '',
  cover_image text DEFAULT '',
  read_time text DEFAULT '',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.10 events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Open Day',
  date text DEFAULT '',
  time text DEFAULT '',
  description text DEFAULT '',
  spots_left integer DEFAULT 0,
  university_ids jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.11 leads
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  nationality text DEFAULT '',
  interested_course text DEFAULT '',
  interested_university text DEFAULT '',
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  admin_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.12 intake_reminders
CREATE TABLE IF NOT EXISTS public.intake_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text DEFAULT '',
  university_name text DEFAULT '',
  intake_label text DEFAULT '',
  deadline_date text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4.13 partner_registrations
CREATE TABLE IF NOT EXISTS public.partner_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  country text NOT NULL DEFAULT '',
  annual_students integer DEFAULT 0,
  trade_license_url text DEFAULT '',
  nid_document_url text DEFAULT '',
  certificate_urls jsonb DEFAULT '[]',
  user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.14 students
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  date_of_birth date,
  gender text DEFAULT '',
  nationality text DEFAULT '',
  passport_number text DEFAULT '',
  passport_url text DEFAULT '',
  previous_institution text DEFAULT '',
  previous_degree text DEFAULT '',
  gpa numeric DEFAULT 0,
  ielts_score numeric DEFAULT 0,
  target_university text DEFAULT '',
  target_course text DEFAULT '',
  degree_level text DEFAULT 'Bachelor',
  intake_month text DEFAULT '',
  status text NOT NULL DEFAULT 'document_review',
  partner_id uuid NOT NULL,
  admin_notes text DEFAULT '',
  academic_transcript_url text DEFAULT '',
  ielts_certificate_url text DEFAULT '',
  personal_statement_url text DEFAULT '',
  recommendation_letter_url text DEFAULT '',
  other_documents jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4.15 partner_notifications
CREATE TABLE IF NOT EXISTS public.partner_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  student_id uuid REFERENCES public.students(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================
-- 4.16 UTILITY FUNCTIONS
-- =====================

-- Function: Check if user has a specific role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

-- ── profiles ──
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── user_roles ──
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- ── countries ──
CREATE POLICY "Public read countries" ON public.countries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage countries" ON public.countries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── universities ──
CREATE POLICY "Public read universities" ON public.universities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage universities" ON public.universities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── courses ──
CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage courses" ON public.courses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── accommodations ──
CREATE POLICY "Public read accommodations" ON public.accommodations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage accommodations" ON public.accommodations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── scholarships ──
CREATE POLICY "Public read scholarships" ON public.scholarships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage scholarships" ON public.scholarships FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── language_centers ──
CREATE POLICY "Public read language_centers" ON public.language_centers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage language_centers" ON public.language_centers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── blogs ──
CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage blogs" ON public.blogs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── events ──
CREATE POLICY "Public read events" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage events" ON public.events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── leads ──
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin manage leads" ON public.leads FOR ALL TO public USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── intake_reminders ──
CREATE POLICY "Anyone can subscribe to reminders" ON public.intake_reminders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin manage reminders" ON public.intake_reminders FOR ALL TO public USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── partner_registrations ──
CREATE POLICY "Anyone can submit registration" ON public.partner_registrations FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Users can read own registration" ON public.partner_registrations FOR SELECT TO public USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage registrations" ON public.partner_registrations FOR ALL TO public USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── students ──
CREATE POLICY "Partners can read own students" ON public.students FOR SELECT TO public USING ((partner_id = auth.uid()) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can insert students" ON public.students FOR INSERT TO public WITH CHECK (partner_id = auth.uid());
CREATE POLICY "Partners can update own students" ON public.students FOR UPDATE TO public USING (partner_id = auth.uid());
CREATE POLICY "Admin manage students" ON public.students FOR ALL TO public USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ── partner_notifications ──
CREATE POLICY "Partners can read own notifications" ON public.partner_notifications FOR SELECT TO authenticated USING ((partner_id = auth.uid()) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Partners can update own notifications" ON public.partner_notifications FOR UPDATE TO authenticated USING (partner_id = auth.uid());
CREATE POLICY "Admin can manage notifications" ON public.partner_notifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================
-- 6. TRIGGERS
-- =====================

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 7. STORAGE BUCKETS
-- =====================

-- Create storage buckets (run in SQL editor)
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-documents', 'partner-documents', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', true) ON CONFLICT (id) DO NOTHING;

-- =====================
-- 8. STORAGE RLS POLICIES
-- =====================

-- partner-documents bucket
CREATE POLICY "Anyone can read partner docs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'partner-documents');
CREATE POLICY "Anyone can upload partner docs" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'partner-documents');
CREATE POLICY "Admin can delete partner docs" ON storage.objects FOR DELETE TO public USING ((bucket_id = 'partner-documents') AND has_role(auth.uid(), 'admin'));

-- student-documents bucket
CREATE POLICY "Read student docs" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'student-documents') AND (auth.uid() IS NOT NULL));
CREATE POLICY "Partners upload student docs" ON storage.objects FOR INSERT TO public WITH CHECK ((bucket_id = 'student-documents') AND (auth.uid() IS NOT NULL));


-- =====================
-- DATA INSERTS
-- =====================

-- profiles: 0 rows

-- user_roles: 0 rows

-- countries (1 rows)
INSERT INTO public.countries (id, name, code, flag_icon, banner_image, capital, currency, language, population, about_text, reasons_to_study, cost_of_living, post_study_work_rights, created_at, updated_at) VALUES ('c0000000-0000-0000-0000-000000000001', 'Malaysia', 'MY', '🇲🇾', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1400&h=600&fit=crop', 'Kuala Lumpur', 'MYR (Ringgit)', 'Malay & English', '33 Million', 'Malaysia has emerged as one of the top education hubs in Asia, hosting over 170,000 international students from 150+ countries. The Malaysian government actively promotes its ''Education Malaysia'' initiative, offering world-class programs at public and private universities, many with dual-degree partnerships with institutions in the UK, Australia, and the US. English is widely spoken and used as the medium of instruction in most international programs, making it an accessible destination for students worldwide.', '[{"title":"Affordable Tuition","iconName":"DollarSign","description":"Tuition fees are 50-70% lower than the US, UK, or Australia while maintaining international standards."},{"title":"Cultural Diversity","iconName":"Globe","description":"Experience a rich multicultural society with Malay, Chinese, Indian, and indigenous cultures."},{"title":"High-Tech Campuses","iconName":"Laptop","description":"Modern universities with state-of-the-art labs, smart classrooms, and digital libraries."},{"title":"Gateway to Asia","iconName":"Plane","description":"Strategic location with easy access to Singapore, Thailand, Indonesia, and beyond."},{"title":"Safe & Welcoming","iconName":"Shield","description":"Ranked one of the safest countries in Southeast Asia with friendly locals."},{"title":"Globally Recognized Degrees","iconName":"Award","description":"Many programs are accredited by UK, Australian, and international bodies."}]'::jsonb, '{"food":"$150 – $250/month","housing":"$200 – $600/month","transport":"$30 – $60/month"}'::jsonb, 'International graduates from Malaysian universities can apply for a 12-month Professional Visit Pass to seek employment. Malaysia''s Digital Nomad visa and growing tech sector also provide pathways for graduates in STEM fields. The Malaysia My Second Home (MM2H) program offers long-term residency options for qualifying individuals.', '2026-03-08T20:07:53.421612+00:00', '2026-03-08T20:07:53.421612+00:00');

-- universities (13 rows)
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('d444f412-e398-464f-a00b-b1adaabb2988', 'Dhaka University', NULL, 'Dhaka', 'data:image/jpeg;base64,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', 'data:image/jpeg;base64,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', 'sdghldfiuhgsliudfbgpiuysdfg;ibusdfbg;buijsdfb;giusdf;iughb;sdfiug;idsufbg;ibusdbfg;iusdfbb;g', 10, 10, 'sadasdas', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, 9999, 9, 2009, '1000', '2026-03-08T20:55:00.750499+00:00', '2026-03-08T20:55:00.750499+00:00', NULL, NULL);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000001', 'University of Malaya (UM)', 'c0000000-0000-0000-0000-000000000001', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop', 'Malaysia''s oldest and top-ranked university, renowned for research excellence and a vibrant international community.', 65, 88, 'Founded in 1905, the University of Malaya (UM) is Malaysia''s oldest and highest-ranked university.', '["Top-ranked university in Malaysia with global recognition","World-class research facilities and laboratories","Vibrant multicultural campus in the heart of KL","Strong industry partnerships and career placement","Affordable tuition compared to Western universities","Beautiful 900-acre campus with modern amenities"]'::jsonb, '[{"answer":"Yes, we offer a range of merit-based and need-based scholarships.","question":"Are scholarships available for international students?"},{"answer":"On-campus housing is available on a first-come, first-served basis.","question":"Is on-campus accommodation guaranteed?"},{"answer":"International students are typically allowed to work part-time during semester breaks.","question":"Can I work part-time while studying?"},{"answer":"All programs are taught in English.","question":"What is the language of instruction?"},{"answer":"Our international office will guide you through the visa process.","question":"How do I apply for a student visa?"}]'::jsonb, '["Submit your application online","Receive your Conditional Offer Letter","Pay the EMGS/Visa processing fee","Receive Visa Approval Letter","Arrive on campus for orientation"]'::jsonb, 28000, 25, 1905, '900 Acres', '2026-03-08T20:09:43.979478+00:00', '2026-03-08T20:09:43.979478+00:00', 3.1209, 101.6538);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000002', 'Universiti Teknologi Malaysia (UTM)', 'c0000000-0000-0000-0000-000000000001', 'Johor Bahru', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=600&fit=crop', 'Leading technical university with strong engineering programs and industry partnerships.', 188, 74, 'UTM is a premier science and technology university committed to developing creative and innovative human capital.', '["Leading engineering and technology programs","Massive 1200-acre campus","Strong industry partnerships","Affordable living costs in Johor Bahru","Dedicated international student support","Active student clubs and sports"]'::jsonb, '[{"answer":"Yes, merit-based and need-based scholarships are available.","question":"Are scholarships available?"},{"answer":"On-campus housing is first-come, first-served.","question":"Is accommodation guaranteed?"},{"answer":"Part-time work is allowed during semester breaks.","question":"Can I work part-time?"},{"answer":"English.","question":"Language of instruction?"},{"answer":"Our office guides you through the process.","question":"Student visa?"}]'::jsonb, '["Submit application online","Receive Offer Letter","Pay EMGS fee","Receive VAL","Arrive for orientation"]'::jsonb, 22000, 18, 1972, '1200 Acres', '2026-03-08T20:09:43.979478+00:00', '2026-03-08T20:09:43.979478+00:00', 1.5594, 103.6369);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000003', 'Monash University Malaysia', 'c0000000-0000-0000-0000-000000000001', 'Subang Jaya', 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1200&h=600&fit=crop', 'A branch campus of Australia''s prestigious Monash University.', 42, 91, 'Monash University Malaysia is the largest campus outside Australia of the prestigious Monash University.', '["Australian degree at a fraction of the cost","40% international student community","World-class medical and engineering programs","Seamless transfer to Australia campus","Modern facilities","Strong alumni network"]'::jsonb, '[{"answer":"Yes, merit-based scholarships are available.","question":"Are scholarships available?"},{"answer":"First-come, first-served.","question":"Is accommodation guaranteed?"},{"answer":"Yes, during semester breaks.","question":"Can I work part-time?"},{"answer":"English.","question":"Language of instruction?"},{"answer":"Our office guides you.","question":"Student visa?"}]'::jsonb, '["Submit application online","Receive Offer Letter","Pay EMGS fee","Receive VAL","Arrive for orientation"]'::jsonb, 8500, 40, 1998, '65 Acres', '2026-03-08T20:09:43.979478+00:00', '2026-03-08T20:09:43.979478+00:00', 3.0645, 101.6011);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000004', 'Taylor''s University', 'c0000000-0000-0000-0000-000000000001', 'Subang Jaya', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1200&h=600&fit=crop', 'Premier private university known for hospitality and business programs.', 284, 68, 'Taylor''s University is Malaysia''s top private university for hospitality and leisure management.', '["#1 in Malaysia for Hospitality","Award-winning lakeside campus","Industry-integrated curriculum","Entrepreneurship hub","Diverse student body from 80+ countries","Strong career services"]'::jsonb, '[{"answer":"Yes.","question":"Are scholarships available?"},{"answer":"First-come, first-served.","question":"Is accommodation guaranteed?"},{"answer":"Yes, during breaks.","question":"Can I work part-time?"},{"answer":"English.","question":"Language of instruction?"},{"answer":"Our office guides you.","question":"Student visa?"}]'::jsonb, '["Submit application online","Receive Offer Letter","Pay EMGS fee","Receive VAL","Arrive for orientation"]'::jsonb, 12000, 22, 1969, '27 Acres', '2026-03-08T20:09:43.979478+00:00', '2026-03-08T20:09:43.979478+00:00', 3.0631, 101.6168);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000005', 'UCSI University', 'c0000000-0000-0000-0000-000000000001', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=600&fit=crop', 'Top private university with diverse programs and global partnerships.', 347, 63, 'UCSI University is one of Malaysia''s leading private universities.', '["Praxis-oriented education","30% international students","Strong music and pharmacy","Multiple campuses","Industry-certified programs","Active research culture"]'::jsonb, '[{"answer":"Yes.","question":"Are scholarships available?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes, during breaks.","question":"Part-time work?"},{"answer":"English.","question":"Language?"},{"answer":"Guided process.","question":"Visa?"}]'::jsonb, '["Submit application","Receive Offer Letter","Pay EMGS fee","Receive VAL","Orientation"]'::jsonb, 10000, 30, 1986, '19 Acres', '2026-03-08T20:09:43.979478+00:00', '2026-03-08T20:09:43.979478+00:00', 3.1571, 101.7243);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000006', 'Universiti Putra Malaysia (UPM)', 'c0000000-0000-0000-0000-000000000001', 'Serdang', 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&h=600&fit=crop', 'Research-intensive university with agriculture and science focus.', 123, 81, 'UPM is a leading research university with roots in agriculture.', '["Top 5 in Malaysia for research","1500-acre green campus","World-leading agricultural science","Affordable tuition","Strong postgrad research","Excellent sports facilities"]'::jsonb, '[{"answer":"Yes.","question":"Scholarships?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes.","question":"Part-time?"},{"answer":"English.","question":"Language?"},{"answer":"Guided.","question":"Visa?"}]'::jsonb, '["Submit application","Offer Letter","EMGS fee","VAL","Orientation"]'::jsonb, 30000, 15, 1931, '1500 Acres', '2026-03-08T20:09:43.979478+00:00', '2026-03-08T20:09:43.979478+00:00', 2.9886, 101.713);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000007', 'Universiti Sains Malaysia (USM)', 'c0000000-0000-0000-0000-000000000001', 'Penang', 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=1200&h=600&fit=crop', 'Malaysia''s APEX university on Penang island.', 137, 79, 'USM is the only APEX status university in Malaysia, located on Penang.', '["APEX status university","Beautiful island campus","Strong medical sciences","Pioneer in sustainability","Affordable living","International exchanges"]'::jsonb, '[{"answer":"Yes.","question":"Scholarships?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes.","question":"Part-time?"},{"answer":"English.","question":"Language?"},{"answer":"Guided.","question":"Visa?"}]'::jsonb, '["Submit application","Offer Letter","EMGS fee","VAL","Orientation"]'::jsonb, 30000, 12, 1969, '416 Acres', '2026-03-08T20:10:02.951449+00:00', '2026-03-08T20:10:02.951449+00:00', 5.3564, 100.3028);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000008', 'Asia Pacific University (APU)', 'c0000000-0000-0000-0000-000000000001', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=600&fit=crop', 'Award-winning university specialising in technology and digital skills.', 450, 60, 'APU is one of Malaysia''s most international universities with students from 130+ countries.', '["50% international students","Technology and innovation focus","Technology Park Malaysia location","Award-winning teaching","100% employability rate","Industry-certified programs"]'::jsonb, '[{"answer":"Yes.","question":"Scholarships?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes.","question":"Part-time?"},{"answer":"English.","question":"Language?"},{"answer":"Guided.","question":"Visa?"}]'::jsonb, '["Submit application","Offer Letter","EMGS fee","VAL","Orientation"]'::jsonb, 13000, 50, 1993, 'Modern Campus', '2026-03-08T20:10:02.951449+00:00', '2026-03-08T20:10:02.951449+00:00', 3.0553, 101.6942);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-000000000009', 'HELP University', 'c0000000-0000-0000-0000-000000000001', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1200&h=600&fit=crop', 'Leading private university with strong psychology and business faculties.', 520, 55, 'HELP University is renowned for psychology and business programs.', '["Top psychology program","Small class sizes","Central KL location","Strong career counselling","Affordable with scholarships","Active student clubs"]'::jsonb, '[{"answer":"Yes.","question":"Scholarships?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes.","question":"Part-time?"},{"answer":"English.","question":"Language?"},{"answer":"Guided.","question":"Visa?"}]'::jsonb, '["Submit application","Offer Letter","EMGS fee","VAL","Orientation"]'::jsonb, 8000, 15, 1986, 'Urban Campus', '2026-03-08T20:10:02.951449+00:00', '2026-03-08T20:10:02.951449+00:00', 3.1103, 101.6541);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-00000000000a', 'Sunway University', 'c0000000-0000-0000-0000-000000000001', 'Subang Jaya', 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=600&fit=crop', 'Rapidly growing private university with Lancaster University partnerships.', 580, 52, 'Sunway University offers dual-degree programs with Lancaster University, UK.', '["Dual-degree with Lancaster","Integrated township","Green campus","Strong business programs","Student exchange","Scholarships available"]'::jsonb, '[{"answer":"Yes.","question":"Scholarships?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes.","question":"Part-time?"},{"answer":"English.","question":"Language?"},{"answer":"Guided.","question":"Visa?"}]'::jsonb, '["Submit application","Offer Letter","EMGS fee","VAL","Orientation"]'::jsonb, 9000, 20, 2004, 'Integrated Resort Campus', '2026-03-08T20:10:02.951449+00:00', '2026-03-08T20:10:02.951449+00:00', 3.0677, 101.6046);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-00000000000b', 'Multimedia University (MMU)', 'c0000000-0000-0000-0000-000000000001', 'Cyberjaya', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=600&fit=crop', 'Pioneer in multimedia and IT education in Malaysia.', 600, 50, 'MMU was Malaysia''s first private university dedicated to ICT and multimedia.', '["Pioneer in multimedia/ICT","Cyberjaya tech hub","Award-winning animation","Telekom Malaysia ties","Affordable","Active esports community"]'::jsonb, '[{"answer":"Yes.","question":"Scholarships?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes.","question":"Part-time?"},{"answer":"English.","question":"Language?"},{"answer":"Guided.","question":"Visa?"}]'::jsonb, '["Submit application","Offer Letter","EMGS fee","VAL","Orientation"]'::jsonb, 18000, 12, 1996, 'Cyberjaya & Melaka', '2026-03-08T20:10:02.951449+00:00', '2026-03-08T20:10:02.951449+00:00', 2.9271, 101.6415);
INSERT INTO public.universities (id, name, country_id, city, logo_url, hero_image, description, ranking, global_score, about_text, study_reasons, faqs, registration_steps, total_students, international_ratio, established, campus_size, created_at, updated_at, latitude, longitude) VALUES ('a0000000-0000-0000-0000-00000000000c', 'Universiti Teknologi MARA (UiTM)', 'c0000000-0000-0000-0000-000000000001', 'Kuala Lumpur', 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop', 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop', 'Malaysia''s largest university with 35 campuses nationwide.', 550, 54, 'UiTM is the largest university in Malaysia with 35 campuses.', '["Largest university network","ACCA-accredited","35 campuses","Professional partnerships","Vibrant culture","Affordable tuition"]'::jsonb, '[{"answer":"Yes.","question":"Scholarships?"},{"answer":"Available.","question":"Accommodation?"},{"answer":"Yes.","question":"Part-time?"},{"answer":"English.","question":"Language?"},{"answer":"Guided.","question":"Visa?"}]'::jsonb, '["Submit application","Offer Letter","EMGS fee","VAL","Orientation"]'::jsonb, 170000, 5, 1956, 'Multiple Campuses', '2026-03-08T20:10:02.951449+00:00', '2026-03-08T20:10:02.951449+00:00', 3.0695, 101.503);

-- courses (21 rows)
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('596c43fa-553f-4a3d-9f34-c59f19a807f6', 'Bachelor of Computer Science', 'a0000000-0000-0000-0000-000000000001', 'Bachelor', 12000, '3 years', '["March","September"]'::jsonb, 'This program equips students with a strong foundation in algorithms, software engineering, data structures, and AI.', '[{"year":"Year 1","modules":["Introduction to Programming","Discrete Mathematics","Computer Architecture","Web Development"]},{"year":"Year 2","modules":["Data Structures & Algorithms","Database Systems","Operating Systems","Software Engineering"]},{"year":"Year 3","modules":["Artificial Intelligence","Cloud Computing","Capstone Project","Cybersecurity"]}]'::jsonb, '{"gpa":3,"ielts":6}'::jsonb, '["Software Engineer","Data Analyst","Full-Stack Developer","Systems Architect","DevOps Engineer"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('adbe128d-a75a-465a-8272-2e7699311719', 'Master of Business Administration', 'a0000000-0000-0000-0000-000000000001', 'Master', 18000, '2 years', '["September"]'::jsonb, 'A transformative MBA program for aspiring leaders covering strategic management, finance, marketing, and entrepreneurship.', '[{"year":"Year 1","modules":["Strategic Management","Financial Accounting","Marketing Management","Organizational Behaviour"]},{"year":"Year 2","modules":["Entrepreneurship","Global Business Strategy","Leadership Seminar","MBA Capstone"]}]'::jsonb, '{"gpa":3.2,"ielts":6.5}'::jsonb, '["Business Consultant","Marketing Director","Product Manager","Startup Founder"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('bf4588ce-22ee-4b86-b3cf-f37c7df7e348', 'Bachelor of Engineering (Mechanical)', 'a0000000-0000-0000-0000-000000000002', 'Bachelor', 14000, '4 years', '["February","September"]'::jsonb, 'A comprehensive mechanical engineering program covering thermodynamics, materials science, and manufacturing.', '[{"year":"Year 1","modules":["Engineering Mathematics","Physics","Engineering Drawing","Workshop Practice"]},{"year":"Year 2","modules":["Thermodynamics","Mechanics of Materials","Fluid Mechanics","Manufacturing"]},{"year":"Year 3","modules":["Machine Design","Control Systems","Heat Transfer","Industrial Training"]},{"year":"Year 4","modules":["Finite Element Analysis","Robotics","Final Year Project","Professional Ethics"]}]'::jsonb, '{"gpa":3,"ielts":5.5}'::jsonb, '["Mechanical Engineer","Design Engineer","Project Manager","R&D Engineer"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('8c6ccd71-5ab5-419a-aac1-8a8f6bf5ed14', 'Bachelor of Medicine (MBBS)', 'a0000000-0000-0000-0000-000000000003', 'Bachelor', 45000, '5 years', '["March"]'::jsonb, 'A world-class medical program offering clinical rotations at leading hospitals.', '[{"year":"Year 1-2","modules":["Anatomy","Biochemistry","Physiology","Pathology","Pharmacology"]},{"year":"Year 3-4","modules":["Clinical Medicine","Surgery","Paediatrics","Obstetrics"]},{"year":"Year 5","modules":["Hospital Rotations","Emergency Medicine","Community Medicine","Final Exams"]}]'::jsonb, '{"gpa":3.7,"ielts":7}'::jsonb, '["Medical Doctor","Surgeon","Specialist Physician","Medical Researcher"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('2663fdfc-0e95-4b39-b5e7-b1c11a89cfa2', 'Diploma in Culinary Arts', 'a0000000-0000-0000-0000-000000000004', 'Foundation', 8000, '2 years', '["January","May","September"]'::jsonb, 'Hands-on culinary training covering international cuisines, pastry arts, and restaurant management.', '[{"year":"Year 1","modules":["Culinary Fundamentals","Food Safety","Pastry Basics","Asian Cuisines"]},{"year":"Year 2","modules":["Western Cuisines","Restaurant Management","Food Photography","Industry Internship"]}]'::jsonb, '{"gpa":2.5,"ielts":5}'::jsonb, '["Chef de Partie","Pastry Chef","Restaurant Manager","Food Consultant"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('ea0a60e0-df65-4287-9411-96e690c51946', 'Bachelor of Pharmacy', 'a0000000-0000-0000-0000-000000000005', 'Bachelor', 16000, '4 years', '["March","September"]'::jsonb, 'A rigorous pharmacy program covering pharmaceutical sciences and clinical pharmacy.', '[{"year":"Year 1","modules":["Pharmaceutical Chemistry","Anatomy","Microbiology","Mathematics"]},{"year":"Year 2","modules":["Pharmacology","Pharmaceutical Analysis","Medicinal Chemistry"]},{"year":"Year 3","modules":["Clinical Pharmacy","Hospital Practice","Drug Formulation"]},{"year":"Year 4","modules":["Advanced Pharmacotherapy","Research Project","Community Internship"]}]'::jsonb, '{"gpa":3.2,"ielts":6}'::jsonb, '["Hospital Pharmacist","Clinical Pharmacist","Pharmaceutical Researcher"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('60105420-0c3c-40f3-9f02-cb45b6e53022', 'PhD in Agricultural Science', 'a0000000-0000-0000-0000-000000000006', 'PhD', 10000, '3 years', '["February"]'::jsonb, 'An advanced research program focused on sustainable agriculture, crop science, and food security.', '[{"year":"Year 1","modules":["Research Methodology","Advanced Crop Science","Soil Science"]},{"year":"Year 2","modules":["Fieldwork","Statistical Analysis","Publication Writing"]},{"year":"Year 3","modules":["Thesis Writing","Viva Voce","Knowledge Transfer"]}]'::jsonb, '{"gpa":3.5,"ielts":6.5}'::jsonb, '["Agricultural Researcher","University Lecturer","Policy Advisor"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('266161b5-67ba-4b94-a78d-6107573148d7', 'Master of Data Science', 'a0000000-0000-0000-0000-000000000001', 'Master', 20000, '2 years', '["September"]'::jsonb, 'A cutting-edge program combining statistics, machine learning, and big data analytics.', '[{"year":"Year 1","modules":["Statistical Learning","Big Data","Machine Learning","Data Visualization"]},{"year":"Year 2","modules":["Deep Learning","NLP","Capstone Project","Ethics in AI"]}]'::jsonb, '{"gpa":3,"ielts":6.5}'::jsonb, '["Data Scientist","ML Engineer","BI Analyst","AI Researcher"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('9283f8a3-6518-40e2-ba8e-727d691c169f', 'Bachelor of Hospitality Management', 'a0000000-0000-0000-0000-000000000004', 'Bachelor', 15000, '3 years', '["January","September"]'::jsonb, 'Combines business management with hands-on hospitality training including 5-star hotel internships.', '[{"year":"Year 1","modules":["Introduction to Hospitality","F&B Operations","Front Office","Business Communication"]},{"year":"Year 2","modules":["Revenue Management","Event Planning","Housekeeping","Industry Internship"]},{"year":"Year 3","modules":["Strategic Hotel Management","Tourism Marketing","Hospitality Entrepreneurship","Final Project"]}]'::jsonb, '{"gpa":2.8,"ielts":5.5}'::jsonb, '["Hotel Manager","Event Coordinator","Tourism Officer","F&B Director"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('094c5c2a-a6e9-4df7-b196-db3482d2a05c', 'Master of Engineering (Electrical)', 'a0000000-0000-0000-0000-000000000002', 'Master', 16000, '2 years', '["September"]'::jsonb, 'Advanced electrical engineering covering power systems, telecommunications, and embedded systems.', '[{"year":"Year 1","modules":["Advanced Power Systems","Digital Signal Processing","Embedded Systems","Research Methods"]},{"year":"Year 2","modules":["IoT & Smart Systems","Renewable Energy","Dissertation","Industry Seminar"]}]'::jsonb, '{"gpa":3,"ielts":6}'::jsonb, '["Electrical Engineer","Power Systems Analyst","IoT Specialist"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('ea739502-a38a-4b48-9bca-30b13be7dbd0', 'Foundation in Science', 'a0000000-0000-0000-0000-000000000008', 'Foundation', 6000, '1 year', '["January","May","September"]'::jsonb, 'A pathway program preparing students for degree-level studies in IT, engineering, and science.', '[{"year":"Year 1","modules":["Mathematics","Physics","Chemistry","English Proficiency","IT Fundamentals"]}]'::jsonb, '{"gpa":2,"ielts":5}'::jsonb, '["Progress to Bachelor Degree"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('a574141c-8d47-43b7-9dc1-3315ff5aee12', 'Bachelor of Software Engineering', 'a0000000-0000-0000-0000-000000000008', 'Bachelor', 13000, '3 years', '["March","September"]'::jsonb, 'Focuses on software design patterns, agile methodologies, and full-stack development.', '[{"year":"Year 1","modules":["Programming","Web Technologies","Mathematics","Database Design"]},{"year":"Year 2","modules":["Software Architecture","Mobile Development","Agile PM","UI/UX"]},{"year":"Year 3","modules":["Cloud Architecture","DevOps","Industry Project","Entrepreneurship"]}]'::jsonb, '{"gpa":2.8,"ielts":5.5}'::jsonb, '["Software Developer","Mobile Developer","QA Engineer","Scrum Master"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('3dd0567b-391d-4f44-86b1-c1fc9d3eae5e', 'Bachelor of Psychology', 'a0000000-0000-0000-0000-000000000009', 'Bachelor', 11000, '3 years', '["January","September"]'::jsonb, 'An accredited psychology program covering clinical, developmental, and organizational psychology.', '[{"year":"Year 1","modules":["Intro to Psychology","Biological Psychology","Statistics","Developmental Psychology"]},{"year":"Year 2","modules":["Cognitive Psychology","Social Psychology","Research Methods","Abnormal Psychology"]},{"year":"Year 3","modules":["Clinical Psychology","Counselling Practicum","Honours Research","Organizational Psychology"]}]'::jsonb, '{"gpa":3,"ielts":6}'::jsonb, '["Clinical Psychologist","Counsellor","HR Specialist","UX Researcher"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('9f56d735-6c09-454a-93e1-e6a6711ad7c9', 'Bachelor of Accounting', 'a0000000-0000-0000-0000-00000000000a', 'Bachelor', 10000, '3 years', '["January","March","September"]'::jsonb, 'An ACCA-accredited accounting program with exemptions.', '[{"year":"Year 1","modules":["Financial Accounting","Business Mathematics","Economics","Business Law"]},{"year":"Year 2","modules":["Management Accounting","Taxation","Auditing","Corporate Finance"]},{"year":"Year 3","modules":["Advanced Financial Reporting","Strategic Management Accounting","Internship","Final Project"]}]'::jsonb, '{"gpa":2.5,"ielts":5.5}'::jsonb, '["Chartered Accountant","Auditor","Tax Consultant","Financial Controller"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('e6545393-7501-4311-8856-b01d2daa2e5f', 'Bachelor of Multimedia Design', 'a0000000-0000-0000-0000-00000000000b', 'Bachelor', 9000, '3 years', '["February","September"]'::jsonb, 'A creative program covering 3D animation, motion graphics, and interactive media.', '[{"year":"Year 1","modules":["Design Fundamentals","Digital Illustration","Photography","Web Design"]},{"year":"Year 2","modules":["3D Modelling","Motion Graphics","UI/UX Design","Video Production"]},{"year":"Year 3","modules":["Advanced Animation","Interactive Media","Portfolio Project","Internship"]}]'::jsonb, '{"gpa":2.5,"ielts":5.5}'::jsonb, '["Graphic Designer","Motion Graphics Artist","UI/UX Designer","3D Animator"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('54803aaa-1057-4e39-a31d-1d227e0d9420', 'Master of Cybersecurity', 'a0000000-0000-0000-0000-00000000000b', 'Master', 14000, '2 years', '["September"]'::jsonb, 'Industry-aligned cybersecurity program covering ethical hacking, digital forensics, and security architecture.', '[{"year":"Year 1","modules":["Network Security","Ethical Hacking","Cryptography","Digital Forensics"]},{"year":"Year 2","modules":["Security Architecture","Incident Response","Research Project","Cloud Security"]}]'::jsonb, '{"gpa":3,"ielts":6}'::jsonb, '["Security Analyst","Penetration Tester","CISO","Security Consultant"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('b8e1c55d-d50f-4938-885d-d16e6ca25985', 'Bachelor of Medical Sciences', 'a0000000-0000-0000-0000-000000000007', 'Bachelor', 13000, '4 years', '["September"]'::jsonb, 'A comprehensive medical sciences program at USM covering biomedical research and public health.', '[{"year":"Year 1","modules":["Cell Biology","Anatomy","Biostatistics","Medical Ethics"]},{"year":"Year 2","modules":["Pharmacology","Pathology","Microbiology","Immunology"]},{"year":"Year 3","modules":["Clinical Biochemistry","Public Health","Research Methods"]},{"year":"Year 4","modules":["Research Project","Advanced Pharmacology","Community Health"]}]'::jsonb, '{"gpa":3.3,"ielts":6}'::jsonb, '["Biomedical Researcher","Public Health Officer","Pharmaceutical Scientist"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('da46902b-cbc9-4c8e-aa53-b45e5c2da501', 'Bachelor of Architecture', 'a0000000-0000-0000-0000-00000000000c', 'Bachelor', 11000, '3.5 years', '["March","September"]'::jsonb, 'An accredited architecture program covering design studio, building technology, and urban planning.', '[{"year":"Year 1","modules":["Design Studio I","Architectural Drawing","History of Architecture"]},{"year":"Year 2","modules":["Design Studio II","Building Technology","Structural Systems"]},{"year":"Year 3","modules":["Design Studio III","Urban Planning","Professional Practice"]},{"year":"Year 3.5","modules":["Final Design Thesis","Portfolio Presentation"]}]'::jsonb, '{"gpa":3,"ielts":6}'::jsonb, '["Architect","Urban Planner","Interior Designer","Landscape Architect"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('ad3bd13b-d6a2-4d90-9cc5-98d274f4cba0', 'Master of Sustainable Development', 'a0000000-0000-0000-0000-000000000007', 'Master', 12000, '2 years', '["February","September"]'::jsonb, 'An interdisciplinary program focusing on environmental sustainability, green technology, and policy.', '[{"year":"Year 1","modules":["Sustainability Science","Environmental Policy","Green Technology","Research Methods"]},{"year":"Year 2","modules":["Climate Change Adaptation","Sustainable Urban Planning","Thesis","Fieldwork"]}]'::jsonb, '{"gpa":3,"ielts":6}'::jsonb, '["Sustainability Officer","Environmental Consultant","Policy Analyst","NGO Director"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('5a3d5f68-791c-4e7d-9446-7190c8e2373b', 'Foundation in Business', 'a0000000-0000-0000-0000-00000000000a', 'Foundation', 5500, '1 year', '["January","May","September"]'::jsonb, 'A pathway into business degrees covering accounting, economics, and business fundamentals.', '[{"year":"Year 1","modules":["Business Studies","Accounting Principles","Economics","Mathematics","English"]}]'::jsonb, '{"gpa":2,"ielts":5}'::jsonb, '["Progress to Bachelor Degree"]'::jsonb, '2026-03-08T20:11:01.566581+00:00', '2026-03-08T20:11:01.566581+00:00');
INSERT INTO public.courses (id, title, university_id, degree_level, tuition_fee, duration, intake_months, overview, curriculum, entry_requirements, career_outcomes, created_at, updated_at) VALUES ('eecaf0a6-acc9-4933-b1b3-b5177663287b', 'hjgfjhj', NULL, 'Bachelor', 1000, '1', '[]'::jsonb, 'fghfdghfgh', '[]'::jsonb, '{}'::jsonb, '[]'::jsonb, '2026-03-08T20:56:40.005982+00:00', '2026-03-08T20:56:40.005982+00:00');

-- accommodations (16 rows)
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('821d0aa6-35d4-4d1e-94e2-ca7d32a5716f', 'KL Sentral Residence', 'Kuala Lumpur', 'Apartment', 800, '["WiFi","Gym","Pool","Security"]'::jsonb, '["a0000000-0000-0000-0000-000000000001","a0000000-0000-0000-0000-000000000005"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('b9fe872e-49f4-4a51-9a83-ad9e5cb2b0de', 'Subang Student Hostel', 'Subang Jaya', 'Hostel', 450, '["WiFi","Laundry","Cafeteria"]'::jsonb, '["a0000000-0000-0000-0000-000000000003","a0000000-0000-0000-0000-000000000004"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('f996256b-a8ff-437d-a5fa-c1182771f919', 'JB Student Lodge', 'Johor Bahru', 'Hostel', 350, '["WiFi","Study Room","Bus Service"]'::jsonb, '["a0000000-0000-0000-0000-000000000002"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('8eec9887-2efc-42fa-9b34-e4fb8107629e', 'Serdang Heights Condo', 'Serdang', 'Condominium', 600, '["WiFi","Pool","Parking","Gym"]'::jsonb, '["a0000000-0000-0000-0000-000000000006"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('5ffb9644-032f-42ac-b08c-8168244bfb8a', 'Bangsar South Studio', 'Kuala Lumpur', 'Studio', 950, '["WiFi","Gym","Concierge","Pool"]'::jsonb, '["a0000000-0000-0000-0000-000000000001","a0000000-0000-0000-0000-000000000005"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('897b286c-cbbb-4f89-8201-96593dd8cef3', 'SS15 Shared House', 'Subang Jaya', 'Shared House', 300, '["WiFi","Kitchen","Garden"]'::jsonb, '["a0000000-0000-0000-0000-000000000003","a0000000-0000-0000-0000-000000000004"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('2ebba8c9-26dd-4681-b48a-642c941a95af', 'Cyberjaya Student Suites', 'Cyberjaya', 'Apartment', 400, '["WiFi","Gym","Shuttle Bus","Study Lounge"]'::jsonb, '["a0000000-0000-0000-0000-00000000000b"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('d4594a2a-a01e-4662-90b5-4dfa649e00d5', 'Penang Heritage Hostel', 'Penang', 'Hostel', 350, '["WiFi","Rooftop Terrace","Kitchen","Bicycle Rental"]'::jsonb, '["a0000000-0000-0000-0000-000000000007"]'::jsonb, '2026-03-08T20:11:16.420376+00:00', '2026-03-08T20:11:16.420376+00:00', 'Residential', '[]'::jsonb, '[]'::jsonb, '', '', '', '', '', NULL, NULL);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('cf96aba6-94b2-4381-8d2d-296c01b9587f', 'Meridin Suites KL', 'Kuala Lumpur', 'Condominium', 850, '["WiFi","Gym","Pool","24h Security","Parking","Laundry"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Residential', '["Studio","1-Bedroom","2-Bedroom"]'::jsonb, '["En-suite","Master Room","Single Room"]'::jsonb, '10 min walk to University of Malaya', 'Modern furnished condominium near KLCC with stunning city views and full amenities.', '', '+60 3-1234 5678', 'info@meridinsuites.my', 3.1178, 101.6531);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('53681b54-6140-41e8-91af-94b46aa7fb00', 'UniLodge Cyberjaya', 'Cyberjaya', 'Student Housing', 550, '["WiFi","Study Lounge","Gym","Cafeteria","24h Security","Laundry"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Student Housing', '["Single","Twin Sharing","Triple"]'::jsonb, '["En-suite","Shared Bathroom"]'::jsonb, '5 min walk to MMU', 'Purpose-built student accommodation right next to MMU and Limkokwing campuses.', '', '+60 3-8888 1234', 'book@unilodge.my', 2.9264, 101.6424);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('6e2d0b92-255a-4ec3-94e0-1ed6fa97bb25', 'Penang Student Hostel', 'Penang', 'Hostel', 380, '["WiFi","Common Kitchen","Laundry","CCTV","Reading Room"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Student Housing', '["Bunk Bed","Single"]'::jsonb, '["4-Bed Dorm","6-Bed Dorm","Single Room"]'::jsonb, '8 min bus to USM', 'Affordable hostel with a friendly community atmosphere, close to USM campus.', '', '+60 4-2345 6789', 'hello@pgstudents.my', 5.3553, 100.3033);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('d9beafb5-324b-4b37-99c7-3ef011463768', 'Setia Sky Residences', 'Kuala Lumpur', 'Apartment', 1200, '["WiFi","Pool","Gym","Sauna","Parking","Concierge","BBQ Area"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Residential', '["1-Bedroom","2-Bedroom","Penthouse"]'::jsonb, '["Master Room","En-suite","Medium Room"]'::jsonb, '15 min drive to UITM', 'Luxury apartment with rooftop infinity pool and panoramic KL skyline views.', '', '+60 3-9876 5432', 'leasing@setiasky.my', 3.1565, 101.7145);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('84dfbca2-4e7a-4acd-9226-98f5a46e08d9', 'D''Latour Shah Alam', 'Shah Alam', 'Condominium', 650, '["WiFi","Gym","Mini Market","Parking","Security","Playground"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Mixed-Use', '["Studio","1-Bedroom","2-Bedroom"]'::jsonb, '["Single Room","Master Room","Medium Room"]'::jsonb, '3 min walk to UiTM Shah Alam', 'Convenient condo near UiTM Shah Alam with shopping mall and LRT access.', '', '+60 3-5555 7890', 'dlatour@property.my', 3.0733, 101.5185);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('56a9d527-0b64-48ff-8340-dc8ed4139113', 'Sunway Student Village', 'Subang Jaya', 'Dormitory', 480, '["WiFi","Meal Plan","Study Room","Gym","Laundry","24h Security"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Student Housing', '["Single","Twin Sharing"]'::jsonb, '["En-suite Single","Shared Twin","Premium Single"]'::jsonb, '2 min walk to Sunway University', 'On-campus dormitory managed by Sunway University with meal plan options.', '', '+60 3-7474 1234', 'housing@sunway.edu.my', 3.0677, 101.6046);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('7009f348-8f47-4a86-8cc4-0e84575a58b5', 'EcoNest Shared House', 'Cyberjaya', 'Shared House', 420, '["WiFi","Garden","Shared Kitchen","Parking","Recycling Station"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Residential', '["Single","Double"]'::jsonb, '["Private Room","Shared Room"]'::jsonb, '10 min bike to UoN Malaysia', 'Eco-friendly shared house with garden, perfect for students who love community living.', '', '+60 3-6677 8899', 'eco@nestliving.my', 2.9188, 101.6528);
INSERT INTO public.accommodations (id, name, city, type, price_per_month, amenities, near_university_ids, created_at, updated_at, property_type, unit_types, room_types, travel_distance, description, image_url, contact_phone, contact_email, latitude, longitude) VALUES ('c4466982-0b16-415a-a20c-c7f93cc105c2', 'The Arc @ Cyberjaya', 'Cyberjaya', 'Studio', 700, '["WiFi","Co-working Space","Rooftop Lounge","Gym","Parking"]'::jsonb, '[]'::jsonb, '2026-03-08T22:34:53.239629+00:00', '2026-03-08T22:34:53.239629+00:00', 'Commercial', '["Studio","Loft Studio"]'::jsonb, '["Studio","Premium Loft"]'::jsonb, '7 min walk to Heriot-Watt Malaysia', 'Trendy studio apartments with co-working space, ideal for postgrad students.', '', '+60 3-4455 6677', 'thearc@cyber.my', 2.9312, 101.6478);

-- scholarships (10 rows)
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('eabd608f-097f-4f79-a825-15811c174d35', 'UM Global Excellence Award', 'a0000000-0000-0000-0000-000000000001', 'Full Tuition', 'GPA 3.7+, IELTS 7.0+', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('79782bde-acfb-4423-a533-793465f56c7b', 'UM Merit Scholarship', 'a0000000-0000-0000-0000-000000000001', '50% Tuition', 'GPA 3.5+, IELTS 6.5+', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('0ed4237f-bb39-4df4-a17c-69774c3ba646', 'UTM Engineering Grant', 'a0000000-0000-0000-0000-000000000002', 'RM 15,000/year', 'GPA 3.5+, Engineering applicants', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('634c3219-530d-474f-8d4c-43a7db2e7eff', 'Monash International Scholarship', 'a0000000-0000-0000-0000-000000000003', 'Full Tuition + Stipend', 'GPA 3.8+, IELTS 7.0+', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('97cdeda2-eba6-4a4f-9513-71b0402301a9', 'Taylor''s Excellence Award', 'a0000000-0000-0000-0000-000000000004', '30% Tuition', 'GPA 3.3+, Leadership activities', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('deb2b2a0-a8e0-40f4-8808-f873cf5be09f', 'UCSI Global Award', 'a0000000-0000-0000-0000-000000000005', 'RM 10,000/year', 'GPA 3.4+, Community service', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('21221ca7-3ca1-49c0-87b8-91e10420b7dd', 'UPM Research Fellowship', 'a0000000-0000-0000-0000-000000000006', 'Full Tuition + Monthly Stipend', 'PhD applicants, Published research', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('fe50cd95-7cc5-43d4-b362-74bb7ebd7bf3', 'USM APEX Scholarship', 'a0000000-0000-0000-0000-000000000007', 'Full Tuition', 'GPA 3.6+, STEM applicants', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('a670a76a-7b25-4bcf-9c49-b07f19ea8688', 'APU Global Tech Scholarship', 'a0000000-0000-0000-0000-000000000008', '50% Tuition', 'GPA 3.5+, Computing applicants', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');
INSERT INTO public.scholarships (id, name, university_id, coverage_amount, criteria, created_at, updated_at) VALUES ('ee90e0e4-a3de-4016-9be0-437ebd2d9e57', 'Sunway-Lancaster Dual Award', 'a0000000-0000-0000-0000-00000000000a', '40% Tuition', 'GPA 3.4+, Business applicants', '2026-03-08T20:11:07.146469+00:00', '2026-03-08T20:11:07.146469+00:00');

-- language_centers (6 rows)
INSERT INTO public.language_centers (id, name, institute, city, duration, tuition_fee, level, overview, curriculum, intake_months, created_at, updated_at) VALUES ('b3122088-daa3-472e-82bb-bc589f5f222b', 'Intensive Conversational Malay', 'APU Language Centre', 'Kuala Lumpur', '12 weeks', 1800, 'Beginner', 'A fast-paced immersive program for international students with zero Malay background. Covers daily conversation, market bargaining, directions, and social interactions.', '["Basic greetings and self-introduction","Numbers, dates, and time","Ordering food and shopping","Transport and directions","Social conversations","Malaysian cultural etiquette"]'::jsonb, '["January","May","September"]'::jsonb, '2026-03-08T20:12:17.236779+00:00', '2026-03-08T20:12:17.236779+00:00');
INSERT INTO public.language_centers (id, name, institute, city, duration, tuition_fee, level, overview, curriculum, intake_months, created_at, updated_at) VALUES ('5d4e30b3-5539-40f4-8f3c-3e41c0208cb0', 'Bahasa Melayu Foundation', 'University of Malaya Language Centre', 'Kuala Lumpur', '16 weeks', 2200, 'Beginner', 'A comprehensive foundation course combining classroom instruction with language lab sessions and peer conversation practice.', '["Malay phonetics and pronunciation","Grammar fundamentals","Reading comprehension","Writing basic essays","Listening drills","Cultural awareness workshops"]'::jsonb, '["February","September"]'::jsonb, '2026-03-08T20:12:17.236779+00:00', '2026-03-08T20:12:17.236779+00:00');
INSERT INTO public.language_centers (id, name, institute, city, duration, tuition_fee, level, overview, curriculum, intake_months, created_at, updated_at) VALUES ('1075eca6-934a-496e-a063-78e336dc1560', 'Business Malay Communication', 'Taylor''s Language Academy', 'Subang Jaya', '10 weeks', 2500, 'Intermediate', 'Designed for professionals who want to use Malay in professional settings. Covers business correspondence, meeting etiquette, and presentations.', '["Formal vs informal registers","Business correspondence","Meeting vocabulary","Negotiation phrases","Professional networking","Malaysian business culture"]'::jsonb, '["March","September"]'::jsonb, '2026-03-08T20:12:17.236779+00:00', '2026-03-08T20:12:17.236779+00:00');
INSERT INTO public.language_centers (id, name, institute, city, duration, tuition_fee, level, overview, curriculum, intake_months, created_at, updated_at) VALUES ('7ac749c3-ea33-4bfa-b053-39f415937169', 'Survival Malay for Students', 'MMU Language Unit', 'Cyberjaya', '8 weeks', 1200, 'Beginner', 'A short practical course for new international students focusing on daily life Malay — ordering food, transport, clinic visits, and landlord communication.', '["Essential daily phrases","Food and restaurant vocabulary","Healthcare phrases","Housing communication","Campus terms","Local slang"]'::jsonb, '["January","May","September"]'::jsonb, '2026-03-08T20:12:17.236779+00:00', '2026-03-08T20:12:17.236779+00:00');
INSERT INTO public.language_centers (id, name, institute, city, duration, tuition_fee, level, overview, curriculum, intake_months, created_at, updated_at) VALUES ('029cd9ad-da8e-4425-9fa3-a6e15ab6e5da', 'Advanced Academic Malay', 'USM School of Languages', 'Penang', '14 weeks', 2800, 'Advanced', 'For students wanting to take courses in Malay or conduct research requiring Malay language sources. Covers academic writing and research presentation.', '["Advanced grammar and syntax","Academic writing","Research presentations","Literary analysis","Thesis writing support","Debate and public speaking"]'::jsonb, '["September"]'::jsonb, '2026-03-08T20:12:17.236779+00:00', '2026-03-08T20:12:17.236779+00:00');
INSERT INTO public.language_centers (id, name, institute, city, duration, tuition_fee, level, overview, curriculum, intake_months, created_at, updated_at) VALUES ('f91ea1b7-ebdd-4ffa-b5dd-c9d5737ee727', 'Malay for Healthcare Professionals', 'Monash Language Centre', 'Subang Jaya', '10 weeks', 2400, 'Intermediate', 'Tailored for medical, nursing, and pharmacy students who need to communicate with patients in Malay during clinical rotations.', '["Medical terminology in Malay","Patient history-taking","Giving instructions","Empathetic communication","Emergency vocabulary","Clinical documentation"]'::jsonb, '["February","September"]'::jsonb, '2026-03-08T20:12:17.236779+00:00', '2026-03-08T20:12:17.236779+00:00');

-- blogs (6 rows)
INSERT INTO public.blogs (id, title, excerpt, content, author, date, image, cover_image, category, read_time, created_at, updated_at) VALUES ('61008c53-f85f-4328-bb0c-0eb7d779c026', 'Top 5 Cafes in Cyberjaya for Students', 'From affordable kopitiam spots to Instagram-worthy brunch places, here are the best cafes where students in Cyberjaya study, eat, and socialise.', 'Cyberjaya may be known as Malaysia''s Silicon Valley, but its cafe scene is rapidly becoming a major draw for students. Whether you need a quiet corner to finish your thesis or a buzzing spot for group study sessions, these five cafes have you covered.

## 1. The Grind Coffee Co.
Located just 5 minutes from MMU campus, The Grind offers strong flat whites and reliable WiFi. Their student meal deal (coffee + sandwich for RM12) is unbeatable.

## 2. Bytes & Beans
This tech-themed cafe in D''Pulze Mall is a favourite among APU students. With power outlets at every table and a no-time-limit policy, it''s practically a co-working space.

## 3. Kopitiam Heritage
For students on a tight budget, this traditional kopitiam serves roti canai for RM1.50 and teh tarik for RM2. It''s authentic Malaysian dining at its finest.

## 4. Bloom Cafe & Bakery
Perfect for weekend brunch, Bloom offers avocado toast, acai bowls, and artisan pastries in a beautifully decorated space.

## 5. The Study Nook
As the name suggests, this cafe was designed for students. Quiet zones, group rooms, and brain-boosting smoothies.', 'Sarah Chen', '2026-03-01', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop', 'Student Life', '5 min read', '2026-03-08T20:12:00.716233+00:00', '2026-03-08T20:12:00.716233+00:00');
INSERT INTO public.blogs (id, title, excerpt, content, author, date, image, cover_image, category, read_time, created_at, updated_at) VALUES ('15eb1f02-acd7-454d-bb44-041b3b9f5b41', 'How to Open a Bank Account in Malaysia', 'A step-by-step guide to setting up your Malaysian bank account, from required documents to choosing the right bank.', 'Opening a bank account is one of the first things you should do when arriving in Malaysia.

## Required Documents
- Valid passport with student visa
- University offer letter or student ID
- Proof of address
- Passport-sized photos (2 copies)

## Best Banks for Students

### Maybank
Malaysia''s largest bank. Their SaveUp account has zero minimum balance and free online banking.

### CIMB
Popular among students for their CIMB Clicks app. Their Octosaver account is student-friendly.

### Bank Islam
Offers Islamic banking products with no hidden fees.

## Pro Tips
- Go during weekday mornings to avoid queues
- Some universities have bank branches on campus
- Set up online banking immediately', 'Ahmad Ibrahim', '2026-02-20', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop', 'Practical Guide', '7 min read', '2026-03-08T20:12:00.716233+00:00', '2026-03-08T20:12:00.716233+00:00');
INSERT INTO public.blogs (id, title, excerpt, content, author, date, image, cover_image, category, read_time, created_at, updated_at) VALUES ('c4704b82-8d63-4fd9-a126-70f5450ae997', 'Scholarship Opportunities for International Students in 2026', 'Explore the latest merit-based and need-based scholarships available across Malaysian universities.', 'Malaysia offers a surprising number of scholarships for international students.

## Government Scholarships

### Malaysia International Scholarship (MIS)
Covers tuition, living allowance, and flights for postgraduate students.

### MTCP Scholarship
Full funding for students from developing countries.

## University Scholarships
- UM Global Excellence Award: Full tuition for GPA 3.7+
- Monash International Scholarship: Full tuition + stipend
- APU Global Tech Scholarship: 50% tuition for computing students
- Taylor''s Excellence Award: 30% tuition with leadership requirements

## Tips for Success
- Apply to multiple scholarships simultaneously
- Highlight extracurricular activities
- Maintain a high GPA for renewal', 'Priya Sharma', '2026-02-15', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&h=250&fit=crop', 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=600&fit=crop', 'Scholarships', '8 min read', '2026-03-08T20:12:00.716233+00:00', '2026-03-08T20:12:00.716233+00:00');
INSERT INTO public.blogs (id, title, excerpt, content, author, date, image, cover_image, category, read_time, created_at, updated_at) VALUES ('f38fc1d9-14b4-465d-953a-05d1fa9e0c84', 'A Weekend Guide to Penang for Students', 'From George Town street art to Penang Hill, here''s how to make the most of your weekend on the Pearl of the Orient.', 'Penang is more than just a study destination — it''s a UNESCO World Heritage treasure.

## Day 1: George Town Heritage
Start at the Armenian Street art trail. Lunch at New Lane Hawker Centre — try char kway teow (RM6). Evening at Gurney Drive hawker stalls.

## Day 2: Nature & Adventure
Take the funicular train up Penang Hill (RM30). Visit the Tropical Spice Garden. Catch sunset at Batu Ferringhi beach.

## Budget: ~RM210 (USD 45) for the weekend', 'Mei Ling Wong', '2026-02-08', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&h=250&fit=crop', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&h=600&fit=crop', 'Student Life', '6 min read', '2026-03-08T20:12:00.716233+00:00', '2026-03-08T20:12:00.716233+00:00');
INSERT INTO public.blogs (id, title, excerpt, content, author, date, image, cover_image, category, read_time, created_at, updated_at) VALUES ('6bd5b451-a281-48ce-ba27-9bdeaaf023bf', 'IELTS vs TOEFL: Which English Test Should You Take?', 'A detailed comparison to help you decide which English proficiency test gives you the best chance of admission.', 'Both IELTS and TOEFL are widely accepted by Malaysian universities.

## IELTS
- More widely accepted in Malaysia
- Face-to-face speaking test
- Cost: ~RM850
- Foundation: 5.0-5.5, Bachelor: 5.5-6.5, Master/PhD: 6.0-7.0

## TOEFL iBT
- Entirely computer-based
- Completed in one sitting
- Foundation: 60-70, Bachelor: 70-90, Master/PhD: 80-100

## Our Recommendation
For Malaysian universities, IELTS is generally the safer choice.', 'James Okonkwo', '2026-01-28', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=600&fit=crop', 'Study Tips', '6 min read', '2026-03-08T20:12:00.716233+00:00', '2026-03-08T20:12:00.716233+00:00');
INSERT INTO public.blogs (id, title, excerpt, content, author, date, image, cover_image, category, read_time, created_at, updated_at) VALUES ('8b958de6-a28c-48b5-93ac-c6b544895b95', 'The Complete Pre-Departure Checklist for Malaysia', 'Everything you need to pack, prepare, and plan before your flight to Malaysia.', 'Moving to Malaysia for studies? Here''s everything you need.

## Documents (Keep in Hand Luggage!)
- Passport (valid 12+ months)
- Student visa / VAL letter
- University offer letter
- Academic transcripts (originals)
- Passport photos (10 copies)

## Financial Preparation
- Carry USD 500-1000 in cash
- Set up Wise/Remitly for transfers
- Budget RM 2000-3000 for first month

## Packing Essentials
Pack light, breathable fabrics. Bring a light jacket for air-conditioned classrooms. Malaysia uses UK-type plugs.

## First Week Action Items
1. Register at university
2. Complete EMGS medical screening
3. Open a bank account
4. Get a local SIM card
5. Set up accommodation', 'Fatima Zahra', '2026-01-15', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=250&fit=crop', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&h=600&fit=crop', 'Practical Guide', '9 min read', '2026-03-08T20:12:00.716233+00:00', '2026-03-08T20:12:00.716233+00:00');

-- events (6 rows)
INSERT INTO public.events (id, title, type, date, time, university_ids, description, spots_left, created_at, updated_at) VALUES ('95da16c2-68e0-43f1-b854-f5c450793852', 'Malaysia Virtual Open Day 2026', 'Open Day', '2026-04-15', '10:00 AM GMT+8', '["a0000000-0000-0000-0000-000000000001","a0000000-0000-0000-0000-000000000002","a0000000-0000-0000-0000-000000000006"]'::jsonb, 'Explore top Malaysian universities from home. Live campus tours and Q&A sessions.', 120, '2026-03-08T20:12:03.47221+00:00', '2026-03-08T20:12:03.47221+00:00');
INSERT INTO public.events (id, title, type, date, time, university_ids, description, spots_left, created_at, updated_at) VALUES ('1b6c74ce-400e-4f99-b6b0-6944b21b117c', 'Student Visa Workshop', 'Workshop', '2026-04-22', '2:00 PM GMT+8', '[]'::jsonb, 'Step-by-step visa application walkthrough with immigration experts.', 45, '2026-03-08T20:12:03.47221+00:00', '2026-03-08T20:12:03.47221+00:00');
INSERT INTO public.events (id, title, type, date, time, university_ids, description, spots_left, created_at, updated_at) VALUES ('ac4d0ed5-997e-405f-be0b-da11dc3cc3fd', 'Scholarship Application Masterclass', 'Webinar', '2026-05-05', '11:00 AM GMT+8', '["a0000000-0000-0000-0000-000000000001","a0000000-0000-0000-0000-000000000003","a0000000-0000-0000-0000-000000000004"]'::jsonb, 'Learn insider tips to craft winning scholarship applications.', 200, '2026-03-08T20:12:03.47221+00:00', '2026-03-08T20:12:03.47221+00:00');
INSERT INTO public.events (id, title, type, date, time, university_ids, description, spots_left, created_at, updated_at) VALUES ('e35781ab-99a9-42e3-883a-022f7da98727', 'Engineering Careers Info Session', 'Info Session', '2026-05-12', '3:00 PM GMT+8', '["a0000000-0000-0000-0000-000000000002"]'::jsonb, 'Discover engineering career paths in Malaysia with UTM faculty.', 80, '2026-03-08T20:12:03.47221+00:00', '2026-03-08T20:12:03.47221+00:00');
INSERT INTO public.events (id, title, type, date, time, university_ids, description, spots_left, created_at, updated_at) VALUES ('8b2d2609-25b7-4f56-9b25-de60916c3ffb', 'Study in Penang — USM Campus Showcase', 'Open Day', '2026-05-20', '10:00 AM GMT+8', '["a0000000-0000-0000-0000-000000000007"]'::jsonb, 'A virtual showcase of USM''s APEX campus on Penang island.', 60, '2026-03-08T20:12:03.47221+00:00', '2026-03-08T20:12:03.47221+00:00');
INSERT INTO public.events (id, title, type, date, time, university_ids, description, spots_left, created_at, updated_at) VALUES ('d973d49f-e100-44b0-86b8-865b4a0b92af', 'Pre-Departure Briefing — Fall 2026', 'Workshop', '2026-07-10', '10:00 AM GMT+8', '["a0000000-0000-0000-0000-000000000001","a0000000-0000-0000-0000-000000000002","a0000000-0000-0000-0000-000000000003"]'::jsonb, 'Everything you need to know before arriving in Malaysia.', 150, '2026-03-08T20:12:03.47221+00:00', '2026-03-08T20:12:03.47221+00:00');

-- leads: 0 rows

-- intake_reminders: 0 rows

-- partner_registrations: 0 rows

-- students: 0 rows

-- partner_notifications: 0 rows

-- =====================
-- 9. EDGE FUNCTIONS (deploy via Supabase CLI)
-- =====================
-- Save each function in: supabase/functions/<name>/index.ts
-- Then deploy with: supabase functions deploy <name>
-- Required secret: RESEND_API_KEY (set via supabase secrets set RESEND_API_KEY=your_key)

-- ─────────────────────────────────────────────
-- 9a. supabase/functions/notify-new-lead/index.ts
-- Sends email to admin users when a new lead is submitted
-- ─────────────────────────────────────────────
/*
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ message: "No admins found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("email")
      .in("user_id", adminRoles.map((r) => r.user_id));

    const adminEmails = (profiles || []).map((p) => p.email).filter(Boolean);

    if (adminEmails.length === 0) {
      return new Response(JSON.stringify({ message: "No admin emails found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: "YourUni Leads <leads@youruni.com>",
        to: adminEmails,
        subject: `New Lead: ${record.full_name} — ${record.source}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2>New Lead Submitted</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Name</td><td style="padding:8px;">${record.full_name}</td></tr>
              <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Email</td><td style="padding:8px;">${record.email}</td></tr>
              <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Phone</td><td style="padding:8px;">${record.phone || "—"}</td></tr>
              <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Nationality</td><td style="padding:8px;">${record.nationality || "—"}</td></tr>
              <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Course</td><td style="padding:8px;">${record.interested_course || "—"}</td></tr>
              <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">University</td><td style="padding:8px;">${record.interested_university || "—"}</td></tr>
              <tr><td style="padding:8px;background:#f8f9fa;font-weight:bold;">Source</td><td style="padding:8px;">${record.source}</td></tr>
            </table>
          </div>
        `,
      }),
    });

    const body = await res.text();
    return new Response(JSON.stringify({ success: res.ok, detail: body }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
*/

-- ─────────────────────────────────────────────
-- 9b. supabase/functions/notify-partner/index.ts
-- Handles partner registration approval/rejection + role assignment + email
-- ─────────────────────────────────────────────
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registration_id, action, admin_notes } = await req.json();

    if (!registration_id || !action) {
      return new Response(JSON.stringify({ error: "Missing registration_id or action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: reg, error: regError } = await supabase
      .from("partner_registrations")
      .select("*")
      .eq("id", registration_id)
      .single();

    if (regError || !reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updateError } = await supabase
      .from("partner_registrations")
      .update({ status: action, admin_notes: admin_notes || "" })
      .eq("id", registration_id);

    if (updateError) throw updateError;

    if (action === "approved" && reg.user_id) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: reg.user_id, role: "partner" }, { onConflict: "user_id,role" });

      if (roleError) console.error("Role assignment error:", roleError);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendKey) {
      const isApproved = action === "approved";
      const subject = isApproved
        ? "Your YourUni Partner Registration is Approved!"
        : "Update on Your YourUni Partner Registration";

      const htmlBody = isApproved
        ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h1>Welcome to YourUni Partner Network!</h1>
            <p>Dear <strong>${reg.contact_person}</strong>,</p>
            <p>Your partner registration for <strong>${reg.agency_name}</strong> has been approved.</p>
            <p>You can now log in to your Partner Dashboard.</p>
            ${admin_notes ? `<p><strong>Note:</strong> ${admin_notes}</p>` : ""}
          </div>`
        : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h1>Partner Registration Update</h1>
            <p>Dear <strong>${reg.contact_person}</strong>,</p>
            <p>We were unable to approve your application for <strong>${reg.agency_name}</strong> at this time.</p>
            ${admin_notes ? `<p><strong>Reason:</strong> ${admin_notes}</p>` : ""}
          </div>`;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "YourUni <noreply@youruni.com>",
            to: [reg.email],
            subject,
            html: htmlBody,
          }),
        });
        if (emailRes.ok) emailSent = true;
      } catch (emailErr) {
        console.error("Email error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailSent, message: `Registration ${action} successfully` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
*/

-- ─────────────────────────────────────────────
-- 9c. supabase/functions/notify-student-status/index.ts
-- Updates student status, creates in-app notification, sends email to partner
-- ─────────────────────────────────────────────
/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { student_id, new_status, admin_notes } = await req.json();

    if (!student_id || !new_status) {
      return new Response(JSON.stringify({ error: "Missing student_id or new_status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", student_id)
      .single();

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const oldStatus = student.status;

    const { error: updateError } = await supabase
      .from("students")
      .update({ status: new_status, admin_notes: admin_notes || "" })
      .eq("id", student_id);

    if (updateError) throw updateError;

    const { data: partner } = await supabase
      .from("partner_registrations")
      .select("email, contact_person, agency_name")
      .eq("user_id", student.partner_id)
      .single();

    const statusLabels = {
      document_review: "Document Review",
      documents_verified: "Documents Verified",
      applied: "Applied",
      offer_received: "Offer Received",
      visa_processing: "Visa Processing",
      visa_approved: "Visa Approved",
      enrolled: "Enrolled",
      rejected: "Rejected",
    };

    const notifType = ["rejected"].includes(new_status) ? "warning"
      : ["visa_approved", "enrolled", "offer_received", "documents_verified"].includes(new_status) ? "success" : "info";

    await supabase.from("partner_notifications").insert({
      partner_id: student.partner_id,
      student_id: student_id,
      title: `${student.full_name} — ${statusLabels[new_status] || new_status}`,
      message: `Status updated from ${statusLabels[oldStatus] || oldStatus} to ${statusLabels[new_status] || new_status}.${admin_notes ? ` Note: ${admin_notes}` : ""}`,
      type: notifType,
    });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendKey && partner) {
      const newLabel = statusLabels[new_status] || new_status;
      const subject = `Student Update: ${student.full_name} — ${newLabel}`;

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "YourUni <noreply@youruni.com>",
            to: [partner.email],
            subject,
            html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;">
              <h2>Student Application Update</h2>
              <p>Dear <strong>${partner.contact_person}</strong>,</p>
              <p>Status for <strong>${student.full_name}</strong> changed to <strong>${newLabel}</strong>.</p>
              <p>University: ${student.target_university || "N/A"}</p>
              <p>Course: ${student.target_course || "N/A"}</p>
              ${admin_notes ? `<p><strong>Note:</strong> ${admin_notes}</p>` : ""}
            </div>`,
          }),
        });
        if (emailRes.ok) emailSent = true;
      } catch (emailErr) {
        console.error("Email error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailSent, oldStatus, newStatus: new_status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
*/

-- ─────────────────────────────────────────────
-- 9d. supabase/functions/send-intake-reminders/index.ts
-- Weekly cron: sends deadline reminder emails to subscribers
-- ─────────────────────────────────────────────
/*
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: reminders, error } = await supabase
      .from("intake_reminders")
      .select("*")
      .eq("active", true);

    if (error) throw error;
    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No active reminders" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const reminder of reminders) {
      if (reminder.deadline_date) {
        const deadline = new Date(reminder.deadline_date);
        if (deadline < new Date()) {
          await supabase.from("intake_reminders").update({ active: false }).eq("id", reminder.id);
          continue;
        }
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: "YourUni Reminders <reminders@youruni.com>",
          to: [reminder.email],
          subject: `Reminder: ${reminder.university_name} ${reminder.intake_label} Deadline`,
          html: `<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;">
            <h2>Deadline Reminder</h2>
            <p>Hi ${reminder.full_name || "there"},</p>
            <p>This is your reminder about:</p>
            <div style="background:#f8f9fa;border-left:4px solid #e94560;padding:16px;margin:16px 0;">
              <p style="margin:0;font-weight:bold;">${reminder.university_name}</p>
              <p style="margin:4px 0;">${reminder.intake_label} Intake</p>
              <p style="margin:4px 0;color:#e94560;font-weight:bold;">Deadline: ${reminder.deadline_date}</p>
            </div>
          </div>`,
        }),
      });

      if (res.ok) {
        sent++;
        await supabase.from("intake_reminders").update({ last_sent_at: new Date().toISOString() }).eq("id", reminder.id);
      }
    }

    return new Response(JSON.stringify({ message: `Sent ${sent} reminder emails` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
*/

-- =====================
-- 10. SUPABASE CONFIG (supabase/config.toml)
-- =====================
-- Add these to your supabase/config.toml:
--
-- [functions.notify-new-lead]
-- verify_jwt = false
--
-- [functions.notify-partner]
-- verify_jwt = false
--
-- [functions.notify-student-status]
-- verify_jwt = false
--
-- [functions.send-intake-reminders]
-- verify_jwt = false

-- =====================
-- 11. AUTH CONFIGURATION NOTES
-- =====================
-- Auth Provider: Email/Password (Supabase Auth)
-- Email confirmation: ENABLED (users must verify email)
-- Anonymous signups: DISABLED
--
-- After importing, manually create your admin user:
-- 1. Sign up via the app or Supabase Auth dashboard
-- 2. Then run:
--    INSERT INTO public.user_roles (user_id, role) VALUES ('<your-user-uuid>', 'admin');
--
-- For partner users:
-- 1. Sign up via the app
-- 2. Submit partner registration
-- 3. Admin approves, then run:
--    INSERT INTO public.user_roles (user_id, role) VALUES ('<partner-user-uuid>', 'partner');
--
-- REQUIRED SECRETS:
--   RESEND_API_KEY = your Resend API key (for email notifications)

