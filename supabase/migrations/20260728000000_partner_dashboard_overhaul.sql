-- Migration: Add wb_student_id, platform_settings, and platform_tutorials
-- This migration adds:
-- 1. wb_student_id auto-incrementing column to students table
-- 2. platform_settings table for admin-manageable settings (Account Manager, etc.)
-- 3. platform_tutorials table for embedded tutorial videos

-- ═══════════════════════════════════════════════════════════════════
-- 1. Add wb_student_id to students
-- ═══════════════════════════════════════════════════════════════════
CREATE SEQUENCE IF NOT EXISTS students_wb_id_seq START WITH 1001;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS wb_student_id INTEGER DEFAULT nextval('students_wb_id_seq');

-- Backfill existing rows that may have NULL
UPDATE public.students
  SET wb_student_id = nextval('students_wb_id_seq')
  WHERE wb_student_id IS NULL;

-- Add unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_wb_student_id
  ON public.students(wb_student_id);

-- ═══════════════════════════════════════════════════════════════════
-- 2. platform_settings table
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default account manager entry
INSERT INTO public.platform_settings (key, value) VALUES (
  'account_manager',
  '{"name": "Account Manager", "email": "info@whiteboard.edu", "phone": "+60123456789", "title": "Partner Relations Manager"}'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 3. platform_tutorials table
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.platform_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  youtube_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- 4. RLS policies
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_tutorials ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings and tutorials
CREATE POLICY "Anyone can read platform_settings"
  ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Anyone can read platform_tutorials"
  ON public.platform_tutorials FOR SELECT USING (true);

-- Only admins can insert/update/delete settings
CREATE POLICY "Admins can insert platform_settings"
  ON public.platform_settings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update platform_settings"
  ON public.platform_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete platform_settings"
  ON public.platform_settings FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Only admins can insert/update/delete tutorials
CREATE POLICY "Admins can insert platform_tutorials"
  ON public.platform_tutorials FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update platform_tutorials"
  ON public.platform_tutorials FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete platform_tutorials"
  ON public.platform_tutorials FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
