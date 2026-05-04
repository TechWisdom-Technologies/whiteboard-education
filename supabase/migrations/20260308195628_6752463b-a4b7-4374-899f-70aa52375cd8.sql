
-- Countries table
CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  flag_icon text DEFAULT '',
  banner_image text DEFAULT '',
  capital text DEFAULT '',
  currency text DEFAULT '',
  language text DEFAULT '',
  population text DEFAULT '',
  about_text text DEFAULT '',
  reasons_to_study jsonb DEFAULT '[]'::jsonb,
  cost_of_living jsonb DEFAULT '{}'::jsonb,
  post_study_work_rights text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Universities table
CREATE TABLE public.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_id uuid REFERENCES public.countries(id) ON DELETE CASCADE,
  city text NOT NULL DEFAULT '',
  logo_url text DEFAULT '',
  hero_image text DEFAULT '',
  description text DEFAULT '',
  ranking integer DEFAULT 0,
  global_score numeric DEFAULT 0,
  about_text text DEFAULT '',
  study_reasons jsonb DEFAULT '[]'::jsonb,
  faqs jsonb DEFAULT '[]'::jsonb,
  registration_steps jsonb DEFAULT '[]'::jsonb,
  total_students integer DEFAULT 0,
  international_ratio integer DEFAULT 0,
  established integer DEFAULT 0,
  campus_size text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  degree_level text NOT NULL DEFAULT 'Bachelor',
  tuition_fee numeric NOT NULL DEFAULT 0,
  duration text DEFAULT '',
  intake_months jsonb DEFAULT '[]'::jsonb,
  overview text DEFAULT '',
  curriculum jsonb DEFAULT '[]'::jsonb,
  entry_requirements jsonb DEFAULT '{}'::jsonb,
  career_outcomes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Accommodations table
CREATE TABLE public.accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'Apartment',
  price_per_month numeric NOT NULL DEFAULT 0,
  amenities jsonb DEFAULT '[]'::jsonb,
  near_university_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Scholarships table
CREATE TABLE public.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  university_id uuid REFERENCES public.universities(id) ON DELETE CASCADE,
  coverage_amount text NOT NULL DEFAULT '',
  criteria text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Language Centers table
CREATE TABLE public.language_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  institute text DEFAULT '',
  city text NOT NULL DEFAULT '',
  duration text DEFAULT '',
  tuition_fee numeric NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'Beginner',
  overview text DEFAULT '',
  curriculum jsonb DEFAULT '[]'::jsonb,
  intake_months jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Blogs table
CREATE TABLE public.blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  author text DEFAULT '',
  date date DEFAULT CURRENT_DATE,
  image text DEFAULT '',
  cover_image text DEFAULT '',
  category text DEFAULT '',
  read_time text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL DEFAULT 'Open Day',
  date text DEFAULT '',
  time text DEFAULT '',
  university_ids jsonb DEFAULT '[]'::jsonb,
  description text DEFAULT '',
  spots_left integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: Public read access for all content tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can read all content
CREATE POLICY "Anyone can read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Anyone can read universities" ON public.universities FOR SELECT USING (true);
CREATE POLICY "Anyone can read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can read accommodations" ON public.accommodations FOR SELECT USING (true);
CREATE POLICY "Anyone can read scholarships" ON public.scholarships FOR SELECT USING (true);
CREATE POLICY "Anyone can read language_centers" ON public.language_centers FOR SELECT USING (true);
CREATE POLICY "Anyone can read blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);

-- Admins can manage all content
CREATE POLICY "Admins can manage countries" ON public.countries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage universities" ON public.universities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage accommodations" ON public.accommodations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage scholarships" ON public.scholarships FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage language_centers" ON public.language_centers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage blogs" ON public.blogs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
