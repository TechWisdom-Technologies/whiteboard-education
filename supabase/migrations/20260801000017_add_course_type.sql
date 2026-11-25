-- Migration: Add course_type column to courses table
-- Safe & non-destructive: defaults to 'Taught Course' for existing and future rows

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS course_type text DEFAULT 'Taught Course';

-- Update existing rows where course_type is NULL or empty
UPDATE public.courses
SET course_type = 'Taught Course'
WHERE course_type IS NULL OR course_type = '';

