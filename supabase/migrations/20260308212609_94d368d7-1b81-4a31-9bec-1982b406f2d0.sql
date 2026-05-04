
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  passport_number TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  date_of_birth DATE,
  gender TEXT DEFAULT '',
  
  -- Academic info
  previous_institution TEXT DEFAULT '',
  previous_degree TEXT DEFAULT '',
  gpa NUMERIC DEFAULT 0,
  ielts_score NUMERIC DEFAULT 0,
  
  -- Target program
  target_university TEXT DEFAULT '',
  target_course TEXT DEFAULT '',
  intake_month TEXT DEFAULT '',
  degree_level TEXT DEFAULT 'Bachelor',
  
  -- Application status (controlled by admin)
  status TEXT NOT NULL DEFAULT 'document_review',
  admin_notes TEXT DEFAULT '',
  
  -- Document URLs
  passport_url TEXT DEFAULT '',
  academic_transcript_url TEXT DEFAULT '',
  ielts_certificate_url TEXT DEFAULT '',
  personal_statement_url TEXT DEFAULT '',
  recommendation_letter_url TEXT DEFAULT '',
  other_documents JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Partners can read/insert/update their own students
CREATE POLICY "Partners can read own students"
  ON public.students FOR SELECT
  USING (partner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can insert students"
  ON public.students FOR INSERT
  WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update own students"
  ON public.students FOR UPDATE
  USING (partner_id = auth.uid());

-- Admin can do everything
CREATE POLICY "Admin manage students"
  ON public.students FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for student documents
INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', true);

-- Storage RLS: partners can upload to their folder, admin can read all
CREATE POLICY "Partners upload student docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student-documents' AND (auth.uid() IS NOT NULL));

CREATE POLICY "Read student docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student-documents' AND (auth.uid() IS NOT NULL));
