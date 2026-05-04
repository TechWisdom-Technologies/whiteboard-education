
-- Fix RLS policies: change from RESTRICTIVE to PERMISSIVE for all content tables

-- universities
DROP POLICY IF EXISTS "Admins can manage universities" ON universities;
DROP POLICY IF EXISTS "Anyone can read universities" ON universities;
CREATE POLICY "Anyone can read universities" ON universities FOR SELECT USING (true);
CREATE POLICY "Admins can manage universities" ON universities FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- courses
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
DROP POLICY IF EXISTS "Anyone can read courses" ON courses;
CREATE POLICY "Anyone can read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage courses" ON courses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- accommodations
DROP POLICY IF EXISTS "Admins can manage accommodations" ON accommodations;
DROP POLICY IF EXISTS "Anyone can read accommodations" ON accommodations;
CREATE POLICY "Anyone can read accommodations" ON accommodations FOR SELECT USING (true);
CREATE POLICY "Admins can manage accommodations" ON accommodations FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- scholarships
DROP POLICY IF EXISTS "Admins can manage scholarships" ON scholarships;
DROP POLICY IF EXISTS "Anyone can read scholarships" ON scholarships;
CREATE POLICY "Anyone can read scholarships" ON scholarships FOR SELECT USING (true);
CREATE POLICY "Admins can manage scholarships" ON scholarships FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- blogs
DROP POLICY IF EXISTS "Admins can manage blogs" ON blogs;
DROP POLICY IF EXISTS "Anyone can read blogs" ON blogs;
CREATE POLICY "Anyone can read blogs" ON blogs FOR SELECT USING (true);
CREATE POLICY "Admins can manage blogs" ON blogs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- events
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Anyone can read events" ON events;
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON events FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- language_centers
DROP POLICY IF EXISTS "Admins can manage language_centers" ON language_centers;
DROP POLICY IF EXISTS "Anyone can read language_centers" ON language_centers;
CREATE POLICY "Anyone can read language_centers" ON language_centers FOR SELECT USING (true);
CREATE POLICY "Admins can manage language_centers" ON language_centers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- countries
DROP POLICY IF EXISTS "Admins can manage countries" ON countries;
DROP POLICY IF EXISTS "Anyone can read countries" ON countries;
CREATE POLICY "Anyone can read countries" ON countries FOR SELECT USING (true);
CREATE POLICY "Admins can manage countries" ON countries FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
