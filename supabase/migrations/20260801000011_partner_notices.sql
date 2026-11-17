-- Migration: Add partner_notices table for Admin Updates & Notices
CREATE TABLE IF NOT EXISTS public.partner_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Update', -- 'Offer', 'Crucial Update', 'Notice', 'Deadline'
  content TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.partner_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read partner_notices"
  ON public.partner_notices FOR SELECT USING (true);

CREATE POLICY "Admins can insert partner_notices"
  ON public.partner_notices FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update partner_notices"
  ON public.partner_notices FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete partner_notices"
  ON public.partner_notices FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

GRANT SELECT ON TABLE public.partner_notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.partner_notices TO authenticated;

-- Seed default notices
INSERT INTO public.partner_notices (title, category, content) VALUES
(
  'Special 20% - 30% Merit Scholarship for Fall Intake',
  'Offer',
  'Selected partner universities in Malaysia are now offering exclusive merit scholarships of up to 20% to 30% on tuition fees for students applying for Fall 2026 undergraduate & postgraduate business and engineering programs. Check university requirement guidelines for eligibility.'
),
(
  'EMGS Visa Approval Turnaround Times',
  'Crucial Update',
  'Please note that the Education Malaysia Global Services (EMGS) is currently processing visa applications within 14-21 business days. Ensure all student academic transcripts, passport scans, and medical questionnaires are submitted early to avoid intake delays.'
),
(
  'New University Partner: Asia Pacific University (APU)',
  'Notice',
  'We are thrilled to welcome Asia Pacific University of Technology & Innovation (APU) to our partner portfolio. All Computing, Artificial Intelligence, and Software Engineering programs are now open for direct partner applications.'
)
ON CONFLICT DO NOTHING;

