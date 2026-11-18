-- Migration: Add campuses to universities, and campus & category to courses
-- Date: 2026-08-01

-- 1. Add campuses jsonb to public.universities if it doesn't exist
ALTER TABLE public.universities 
ADD COLUMN IF NOT EXISTS campuses jsonb DEFAULT '[]'::jsonb;

-- 2. Populate existing universities campuses from city if empty
UPDATE public.universities
SET campuses = (
  SELECT COALESCE(
    jsonb_agg(trim(c.val)),
    '[]'::jsonb
  )
  FROM (
    SELECT regexp_split_to_table(city, '[,;&]+') AS val
  ) c
  WHERE trim(c.val) <> ''
)
WHERE (campuses IS NULL OR jsonb_array_length(campuses) = 0)
  AND city IS NOT NULL 
  AND trim(city) <> '';

-- 3. Add campus text column to public.courses if it doesn't exist
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS campus text DEFAULT '';

-- 4. Add category text column to public.courses if it doesn't exist
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS category text DEFAULT '';

-- 5. Create indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_courses_university_id ON public.courses(university_id);
CREATE INDEX IF NOT EXISTS idx_courses_degree_level ON public.courses(degree_level);
CREATE INDEX IF NOT EXISTS idx_courses_campus ON public.courses(campus);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);

-- 6. Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
