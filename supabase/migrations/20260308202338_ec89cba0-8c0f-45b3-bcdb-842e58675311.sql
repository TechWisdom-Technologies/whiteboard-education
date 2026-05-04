
-- Drop all existing restrictive policies and recreate as permissive

-- accommodations
DROP POLICY IF EXISTS "Anyone can read accommodations" ON accommodations;
DROP POLICY IF EXISTS "Admins can manage accommodations" ON accommodations;
CREATE POLICY "Public read accommodations" ON accommodations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage accommodations" ON accommodations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- universities
DROP POLICY IF EXISTS "Anyone can read universities" ON universities;
DROP POLICY IF EXISTS "Admins can manage universities" ON universities;
CREATE POLICY "Public read universities" ON universities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage universities" ON universities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- courses
DROP POLICY IF EXISTS "Anyone can read courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Public read courses" ON courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage courses" ON courses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- scholarships
DROP POLICY IF EXISTS "Anyone can read scholarships" ON scholarships;
DROP POLICY IF EXISTS "Admins can manage scholarships" ON scholarships;
CREATE POLICY "Public read scholarships" ON scholarships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage scholarships" ON scholarships FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- blogs
DROP POLICY IF EXISTS "Anyone can read blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can manage blogs" ON blogs;
CREATE POLICY "Public read blogs" ON blogs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage blogs" ON blogs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- events
DROP POLICY IF EXISTS "Anyone can read events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Public read events" ON events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage events" ON events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- language_centers
DROP POLICY IF EXISTS "Anyone can read language_centers" ON language_centers;
DROP POLICY IF EXISTS "Admins can manage language_centers" ON language_centers;
CREATE POLICY "Public read language_centers" ON language_centers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage language_centers" ON language_centers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- countries
DROP POLICY IF EXISTS "Anyone can read countries" ON countries;
DROP POLICY IF EXISTS "Admins can manage countries" ON countries;
CREATE POLICY "Public read countries" ON countries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage countries" ON countries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
