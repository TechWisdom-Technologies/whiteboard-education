
-- Leads table for capturing Apply Now and form submissions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  interested_course TEXT DEFAULT '',
  interested_university TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Intake reminders table
CREATE TABLE public.intake_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  university_name TEXT DEFAULT '',
  intake_label TEXT DEFAULT '',
  deadline_date TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for leads: public insert, admin read/manage
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage leads" ON public.leads
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS for intake_reminders: public insert, admin read
ALTER TABLE public.intake_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to reminders" ON public.intake_reminders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin manage reminders" ON public.intake_reminders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger for leads
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
