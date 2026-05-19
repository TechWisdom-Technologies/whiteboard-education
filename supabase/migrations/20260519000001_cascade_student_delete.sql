-- Add DELETE policy for partners on students
CREATE POLICY "Partners can delete own students"
  ON public.students FOR DELETE
  USING (partner_id = auth.uid());

-- Function to cascade delete admin notifications
CREATE OR REPLACE FUNCTION cascade_delete_notifications()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.admin_notifications
  WHERE source_id = OLD.id::text AND source_table = TG_TABLE_NAME;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables
DROP TRIGGER IF EXISTS trg_cascade_delete_students ON public.students;
CREATE TRIGGER trg_cascade_delete_students
BEFORE DELETE ON public.students
FOR EACH ROW EXECUTE FUNCTION cascade_delete_notifications();

DROP TRIGGER IF EXISTS trg_cascade_delete_leads ON public.leads;
CREATE TRIGGER trg_cascade_delete_leads
BEFORE DELETE ON public.leads
FOR EACH ROW EXECUTE FUNCTION cascade_delete_notifications();

DROP TRIGGER IF EXISTS trg_cascade_delete_partners ON public.partner_registrations;
CREATE TRIGGER trg_cascade_delete_partners
BEFORE DELETE ON public.partner_registrations
FOR EACH ROW EXECUTE FUNCTION cascade_delete_notifications();
