-- Migration to allow partners to update their own registrations and documents

-- 1. Allow partners to update their own registration row
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'partner_registrations' 
    AND policyname = 'Users can update own registration'
  ) THEN
    CREATE POLICY "Users can update own registration"
      ON public.partner_registrations FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Allow partners to update (upsert) their own files in the storage bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Users can update own partner docs'
  ) THEN
    CREATE POLICY "Users can update own partner docs"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'partner-documents');
  END IF;
END $$;
