-- Migration: Create departments table with RLS and seed defaults
-- Date: 2026-08-01

-- 1. Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments 
  FOR SELECT TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "Admin manage departments" ON public.departments;
CREATE POLICY "Admin manage departments" ON public.departments 
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'admin')) 
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Grants
GRANT SELECT ON TABLE public.departments TO anon;
GRANT ALL ON TABLE public.departments TO authenticated;

-- 5. Seed default departments
INSERT INTO public.departments (name) VALUES
  ('Business & Management'),
  ('Engineering'),
  ('Computer Science & IT'),
  ('Medicine & Health'),
  ('Arts & Design'),
  ('Natural Sciences'),
  ('Law'),
  ('Social Sciences')
ON CONFLICT (name) DO NOTHING;

-- 6. Backfill from existing course categories if present
INSERT INTO public.departments (name)
SELECT DISTINCT trim(category)
FROM public.courses
WHERE category IS NOT NULL AND trim(category) <> ''
ON CONFLICT (name) DO NOTHING;

-- 7. Reload schema cache
NOTIFY pgrst, 'reload schema';

