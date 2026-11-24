-- Migration: Add yearly_fees, other_fees, offer_letter, class_type, and entry_requirements_text to courses
-- Safe & non-destructive: will not affect existing courses or rows.

-- 1. Safely add the missing columns if they don't exist
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS yearly_fees jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS scholarship numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_fees jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS offer_letter text DEFAULT '',
  ADD COLUMN IF NOT EXISTS class_type text DEFAULT 'Physical',
  ADD COLUMN IF NOT EXISTS entry_requirements_text text DEFAULT '';

-- 2. Backfill for existing courses: if a course already has tuition_fee > 0,
-- automatically populate yearly_fees with 1st Year fee so it doesn't show "No Data"
UPDATE public.courses
SET yearly_fees = jsonb_build_array(
  jsonb_build_object('year', '1st Year', 'fee', 'MYR ' || tuition_fee::text)
)
WHERE (yearly_fees IS NULL OR yearly_fees = '[]'::jsonb)
  AND tuition_fee IS NOT NULL 
  AND tuition_fee > 0;

