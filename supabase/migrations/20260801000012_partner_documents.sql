-- Migration: Add partner_documents table for Admin Document Management
CREATE TABLE IF NOT EXISTS public.partner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf', -- 'pdf', 'image', 'word', 'excel', 'zip', 'other'
  file_size NUMERIC(10, 2) NOT NULL DEFAULT 1.0, -- in MB
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.partner_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read partner_documents"
  ON public.partner_documents FOR SELECT USING (true);

CREATE POLICY "Admins can insert partner_documents"
  ON public.partner_documents FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update partner_documents"
  ON public.partner_documents FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete partner_documents"
  ON public.partner_documents FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

GRANT SELECT ON TABLE public.partner_documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_documents TO authenticated;

-- Seed default documents
INSERT INTO public.partner_documents (title, file_url, file_type, file_size) VALUES
(
  '2026 Malaysia University Admissions & Study Guide',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'pdf',
  4.20
),
(
  'Partner Commission Structure & Intake Deadlines',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'excel',
  1.85
),
(
  'Student Visa Application Checklist (EMGS Guidelines)',
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'word',
  2.10
),
(
  'Whiteboard Education Official Partner Branding Pack',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
  'image',
  8.50
)
ON CONFLICT DO NOTHING;

