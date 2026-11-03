-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000002_security_remediation_storage.sql
-- Description: Convert sensitive document storage buckets to private,
--              and enforce strict ownership-based RLS on storage.objects.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Ensure buckets exist with appropriate visibility settings
-- Creates buckets if they do not exist, or updates their public visibility
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('student-documents', 'student-documents', false),
  ('partner-documents', 'partner-documents', false),
  ('universities', 'universities', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Drop existing insecure / broad storage policies
DROP POLICY IF EXISTS "Anyone can read partner docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload partner docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own partner docs" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete partner docs" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can read student docs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload student docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own student docs" ON storage.objects;

DROP POLICY IF EXISTS "Admins full access student-documents" ON storage.objects;
DROP POLICY IF EXISTS "Approved partners view own student docs" ON storage.objects;
DROP POLICY IF EXISTS "Approved partners upload own student docs" ON storage.objects;
DROP POLICY IF EXISTS "Approved partners update own student docs" ON storage.objects;

DROP POLICY IF EXISTS "Admins full access partner-documents" ON storage.objects;
DROP POLICY IF EXISTS "Partners view own partner docs" ON storage.objects;
DROP POLICY IF EXISTS "Partners upload own partner docs" ON storage.objects;
DROP POLICY IF EXISTS "Partners update own partner docs" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view universities images" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage universities images" ON storage.objects;

-- ───────────────────────────────────────────────────────────────────
-- 3. Storage Policies: student-documents (Private)
-- ───────────────────────────────────────────────────────────────────

-- Admins: complete access to all student documents
CREATE POLICY "Admins full access student-documents"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'student-documents' AND
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'student-documents' AND
  public.has_role(auth.uid(), 'admin')
);

-- Approved Partners: view documents for their own students
CREATE POLICY "Approved partners view own student docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-documents' AND
  public.is_approved_partner(auth.uid()) AND
  (
    name LIKE (auth.uid()::text || '/%') OR
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.partner_id = auth.uid()
        AND (
          name LIKE ('%/' || s.id::text || '/%') OR
          name LIKE ('%/' || s.id::text || '_%')
        )
    )
  )
);

-- Approved Partners: upload documents for their own students
CREATE POLICY "Approved partners upload own student docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'student-documents' AND
  public.is_approved_partner(auth.uid()) AND
  name LIKE (auth.uid()::text || '/%')
);

-- Approved Partners: update/upsert documents in their own directory
CREATE POLICY "Approved partners update own student docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'student-documents' AND
  public.is_approved_partner(auth.uid()) AND
  name LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'student-documents' AND
  public.is_approved_partner(auth.uid()) AND
  name LIKE (auth.uid()::text || '/%')
);

-- ───────────────────────────────────────────────────────────────────
-- 4. Storage Policies: partner-documents (Private)
-- ───────────────────────────────────────────────────────────────────

-- Admins: complete access to all partner documents
CREATE POLICY "Admins full access partner-documents"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'partner-documents' AND
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'partner-documents' AND
  public.has_role(auth.uid(), 'admin')
);

-- Registered Partners: view their own agency documents and avatar
CREATE POLICY "Partners view own partner docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'partner-documents' AND
  (
    name LIKE (auth.uid()::text || '/%') OR
    name LIKE ('partner_' || auth.uid()::text || '/%') OR
    name LIKE ('admin_' || auth.uid()::text || '/%')
  )
);

-- Registered Partners: upload to their own partner document folder
CREATE POLICY "Partners upload own partner docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'partner-documents' AND
  (
    name LIKE (auth.uid()::text || '/%') OR
    name LIKE ('partner_' || auth.uid()::text || '/%') OR
    name LIKE ('admin_' || auth.uid()::text || '/%')
  )
);

-- Registered Partners: update/upsert their own files
CREATE POLICY "Partners update own partner docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'partner-documents' AND
  (
    name LIKE (auth.uid()::text || '/%') OR
    name LIKE ('partner_' || auth.uid()::text || '/%') OR
    name LIKE ('admin_' || auth.uid()::text || '/%')
  )
)
WITH CHECK (
  bucket_id = 'partner-documents' AND
  (
    name LIKE (auth.uid()::text || '/%') OR
    name LIKE ('partner_' || auth.uid()::text || '/%') OR
    name LIKE ('admin_' || auth.uid()::text || '/%')
  )
);

-- ───────────────────────────────────────────────────────────────────
-- 5. Storage Policies: universities (Public Content)
-- ───────────────────────────────────────────────────────────────────

-- Public can read all university marketing assets
CREATE POLICY "Anyone can view universities images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'universities');

-- Only admins can upload, edit, or delete university assets
CREATE POLICY "Admins manage universities images"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'universities' AND
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'universities' AND
  public.has_role(auth.uid(), 'admin')
);

