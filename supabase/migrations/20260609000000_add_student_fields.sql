-- Migration to add nid_number, major, and language_test_name columns to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS nid_number TEXT DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS major TEXT DEFAULT '';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS language_test_name TEXT DEFAULT '';
