
-- Create partner_registrations table
CREATE TABLE public.partner_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  country text NOT NULL DEFAULT '',
  annual_students integer DEFAULT 0,
  phone text DEFAULT '',
  nid_document_url text DEFAULT '',
  trade_license_url text DEFAULT '',
  certificate_urls jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_registrations ENABLE ROW LEVEL SECURITY;

-- Public can insert (register)
CREATE POLICY "Anyone can submit registration"
  ON public.partner_registrations FOR INSERT
  WITH CHECK (true);

-- Users can read their own registration
CREATE POLICY "Users can read own registration"
  ON public.partner_registrations FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Admin can manage all
CREATE POLICY "Admin manage registrations"
  ON public.partner_registrations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for partner documents
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-documents', 'partner-documents', true);

-- Storage policies
CREATE POLICY "Anyone can upload partner docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'partner-documents');

CREATE POLICY "Anyone can read partner docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-documents');

CREATE POLICY "Admin can delete partner docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'partner-documents' AND public.has_role(auth.uid(), 'admin'));
