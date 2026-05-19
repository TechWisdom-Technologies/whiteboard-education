-- Migration to add passport_photo_url column to students table
ALTER TABLE public.students
ADD COLUMN passport_photo_url TEXT DEFAULT '';
