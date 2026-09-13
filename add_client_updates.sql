-- Add new columns to students table for profile creation updates
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS program_start_date date,
ADD COLUMN IF NOT EXISTS program_end_date date,
ADD COLUMN IF NOT EXISTS cv_url text,
ADD COLUMN IF NOT EXISTS research_proposal_url text,
ADD COLUMN IF NOT EXISTS additional_education jsonb;

-- Add new column to student_applications table for custom university names
ALTER TABLE student_applications
ADD COLUMN IF NOT EXISTS custom_university_name text;
