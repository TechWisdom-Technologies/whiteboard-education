
-- Fix profiles RLS to be permissive
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Fix all content tables to be permissive
DROP POLICY IF EXISTS "Public read accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Admin manage accommodations" ON public.accommodations;
DROP POLICY IF EXISTS "Public read universities" ON public.universities;
DROP POLICY IF EXISTS "Admin manage universities" ON public.universities;
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
DROP POLICY IF EXISTS "Admin manage courses" ON public.courses;
DROP POLICY IF EXISTS "Public read scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Admin manage scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Public read blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admin manage blogs" ON public.blogs;
DROP POLICY IF EXISTS "Public read events" ON public.events;
DROP POLICY IF EXISTS "Admin manage events" ON public.events;
DROP POLICY IF EXISTS "Public read language_centers" ON public.language_centers;
DROP POLICY IF EXISTS "Admin manage language_centers" ON public.language_centers;
DROP POLICY IF EXISTS "Public read countries" ON public.countries;
DROP POLICY IF EXISTS "Admin manage countries" ON public.countries;

-- Also drop any old naming variants
DROP POLICY IF EXISTS "Public read accommodations " ON public.accommodations;
DROP POLICY IF EXISTS "Admin manage accommodations " ON public.accommodations;
DROP POLICY IF EXISTS "Public read universities " ON public.universities;
DROP POLICY IF EXISTS "Admin manage universities " ON public.universities;
DROP POLICY IF EXISTS "Public read courses " ON public.courses;
DROP POLICY IF EXISTS "Admin manage courses " ON public.courses;
DROP POLICY IF EXISTS "Public read scholarships " ON public.scholarships;
DROP POLICY IF EXISTS "Admin manage scholarships " ON public.scholarships;
DROP POLICY IF EXISTS "Public read blogs " ON public.blogs;
DROP POLICY IF EXISTS "Admin manage blogs " ON public.blogs;
DROP POLICY IF EXISTS "Public read events " ON public.events;
DROP POLICY IF EXISTS "Admin manage events " ON public.events;
DROP POLICY IF EXISTS "Public read language_centers " ON public.language_centers;
DROP POLICY IF EXISTS "Admin manage language_centers " ON public.language_centers;
DROP POLICY IF EXISTS "Public read countries " ON public.countries;
DROP POLICY IF EXISTS "Admin manage countries " ON public.countries;

-- Recreate all as PERMISSIVE
CREATE POLICY "Public read accommodations" ON public.accommodations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage accommodations" ON public.accommodations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read universities" ON public.universities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage universities" ON public.universities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read courses" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage courses" ON public.courses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read scholarships" ON public.scholarships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage scholarships" ON public.scholarships FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read blogs" ON public.blogs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage blogs" ON public.blogs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read events" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read language_centers" ON public.language_centers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage language_centers" ON public.language_centers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read countries" ON public.countries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage countries" ON public.countries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
