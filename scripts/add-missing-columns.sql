-- ================================================================
-- Whiteboard Education: Add missing columns to courses table
-- ================================================================
-- Run this BEFORE running import-all-courses-part*.sql
-- ================================================================

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS offer_letter TEXT DEFAULT 'Free',
  ADD COLUMN IF NOT EXISTS entry_requirements_text TEXT DEFAULT '';

-- Verify the columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'courses'
ORDER BY ordinal_position;
