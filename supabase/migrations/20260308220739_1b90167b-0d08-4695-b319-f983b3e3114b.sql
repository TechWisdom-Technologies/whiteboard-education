
CREATE TABLE public.partner_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners can read own notifications"
  ON public.partner_notifications FOR SELECT
  TO authenticated
  USING (partner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can update own notifications"
  ON public.partner_notifications FOR UPDATE
  TO authenticated
  USING (partner_id = auth.uid());

CREATE POLICY "Admin can manage notifications"
  ON public.partner_notifications FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for fast partner lookups
CREATE INDEX idx_partner_notifications_partner_id ON public.partner_notifications(partner_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_notifications;
