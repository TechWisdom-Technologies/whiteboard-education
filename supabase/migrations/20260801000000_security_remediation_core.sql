-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000000_security_remediation_core.sql
-- Description: Core security helper functions, schema alterations,
--              referential integrity rules, and column-protection triggers.
-- ═══════════════════════════════════════════════════════════════════

-- 1. Helper function: verify approved partner status
CREATE OR REPLACE FUNCTION public.is_approved_partner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.partner_registrations pr ON pr.user_id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = 'partner'
      AND pr.status = 'approved'
  );
$$;

-- 2. Helper function: retrieve partner agency name for secure messaging
CREATE OR REPLACE FUNCTION public.get_partner_agency_name(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT agency_name
  FROM public.partner_registrations
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- 3. Schema adjustments: student_applications
-- Drop NOT NULL constraints on university_id and course_id to allow custom university applications
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'student_applications' 
      AND column_name = 'university_id' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.student_applications ALTER COLUMN university_id DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'student_applications' 
      AND column_name = 'course_id' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.student_applications ALTER COLUMN course_id DROP NOT NULL;
  END IF;
END $$;

-- Ensure custom_university_name column exists
ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS custom_university_name TEXT;

-- Enforce check constraint: must have catalog university+course OR custom_university_name
ALTER TABLE public.student_applications
  DROP CONSTRAINT IF EXISTS chk_app_university_or_custom;

ALTER TABLE public.student_applications
  ADD CONSTRAINT chk_app_university_or_custom
  CHECK (
    (university_id IS NOT NULL AND course_id IS NOT NULL) OR
    (custom_university_name IS NOT NULL AND trim(custom_university_name) <> '')
  );

-- 4. Schema adjustments: student_notes
ALTER TABLE public.student_notes
  ADD COLUMN IF NOT EXISTS sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 5. Schema adjustments: platform_tutorials
ALTER TABLE public.platform_tutorials
  ADD COLUMN IF NOT EXISTS video_url TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'platform_tutorials' 
      AND column_name = 'youtube_url' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.platform_tutorials ALTER COLUMN youtube_url DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE public.platform_tutorials
  DROP CONSTRAINT IF EXISTS chk_tutorial_video_url;

ALTER TABLE public.platform_tutorials
  ADD CONSTRAINT chk_tutorial_video_url
  CHECK (
    (youtube_url IS NOT NULL AND trim(youtube_url) <> '') OR
    (video_url IS NOT NULL AND trim(video_url) <> '')
  );

-- 6. Trigger: Student Column Protection on UPDATE
CREATE OR REPLACE FUNCTION public.protect_student_admin_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Admins retain full management authority
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Disallow modifying ownership
  IF NEW.partner_id IS DISTINCT FROM OLD.partner_id THEN
    RAISE EXCEPTION 'Partners cannot modify student partner_id ownership.';
  END IF;

  -- Disallow modifying primary key or created_at
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify student system ID or creation timestamp.';
  END IF;

  -- Disallow modifying administrative identifiers
  IF NEW.wb_student_id IS DISTINCT FROM OLD.wb_student_id OR 
     NEW.wbe_student_id IS DISTINCT FROM OLD.wbe_student_id OR
     NEW.student_number IS DISTINCT FROM OLD.student_number THEN
    RAISE EXCEPTION 'Partners cannot modify student identification numbers.';
  END IF;

  -- Disallow modifying application / admissions processing status
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Partners cannot modify student administrative status.';
  END IF;

  -- Disallow modifying internal administrative notes
  IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
    RAISE EXCEPTION 'Partners cannot modify administrative internal notes.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_student_admin_columns ON public.students;
CREATE TRIGGER trg_protect_student_admin_columns
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.protect_student_admin_columns();

-- 7. Trigger: Student Notes Sender Attribution
CREATE OR REPLACE FUNCTION public.enforce_student_notes_sender()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.sender_user_id := coalesce(auth.uid(), NEW.sender_user_id);
  
  IF public.has_role(auth.uid(), 'admin') THEN
    NEW.admin_name := '[Role:Admin] Whiteboard Team';
  ELSE
    NEW.admin_name := '[Role:Partner] ' || coalesce(public.get_partner_agency_name(auth.uid()), 'Partner Agency');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_student_notes_sender ON public.student_notes;
CREATE TRIGGER trg_enforce_student_notes_sender
BEFORE INSERT ON public.student_notes
FOR EACH ROW
EXECUTE FUNCTION public.enforce_student_notes_sender();

-- 8. Trigger: Partner Registration Protection on UPDATE
CREATE OR REPLACE FUNCTION public.protect_partner_registration_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Admins can update any registration field
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Disallow self-approval or status change
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Partners cannot modify registration approval status.';
  END IF;

  -- Disallow modifying admin notes
  IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
    RAISE EXCEPTION 'Partners cannot modify administrative internal notes.';
  END IF;

  -- Disallow transferring registration ownership
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Partners cannot reassign registration ownership.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_partner_registration_fields ON public.partner_registrations;
CREATE TRIGGER trg_protect_partner_registration_fields
BEFORE UPDATE ON public.partner_registrations
FOR EACH ROW
EXECUTE FUNCTION public.protect_partner_registration_fields();

-- 9. Trigger: Partner Notifications Column Restriction on UPDATE
CREATE OR REPLACE FUNCTION public.restrict_partner_notifications_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admins can ONLY modify the 'read' flag
  IF NEW.id IS DISTINCT FROM OLD.id OR
     NEW.partner_id IS DISTINCT FROM OLD.partner_id OR
     NEW.student_id IS DISTINCT FROM OLD.student_id OR
     NEW.title IS DISTINCT FROM OLD.title OR
     NEW.message IS DISTINCT FROM OLD.message OR
     NEW.type IS DISTINCT FROM OLD.type OR
     NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Partners can only update the read status of notifications.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restrict_partner_notifications_update ON public.partner_notifications;
CREATE TRIGGER trg_restrict_partner_notifications_update
BEFORE UPDATE ON public.partner_notifications
FOR EACH ROW
EXECUTE FUNCTION public.restrict_partner_notifications_update();

-- 10. Security Definer Hardening: notify_admin_student_doc_review
-- Fix search_path to prevent path hijacking and restrict execute permissions
CREATE OR REPLACE FUNCTION public.notify_admin_student_doc_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF new.status = 'document_review' AND (tg_op = 'INSERT' OR new.status IS DISTINCT FROM old.status) THEN
    INSERT INTO public.admin_notifications (source_table, source_id, event_type, title, message, href, metadata)
    VALUES (
      'students',
      new.id::text,
      'student_document_review',
      'Student in Document Review',
      coalesce(new.full_name, 'Student') || ' (' || coalesce(new.target_university, 'No university') || ') needs review',
      '/admin/students',
      jsonb_build_object('studentId', new.id)
    )
    ON CONFLICT (source_table, source_id, event_type) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- Revoke direct execution from client roles (only triggers need to invoke this)
REVOKE EXECUTE ON FUNCTION public.notify_admin_student_doc_review() FROM PUBLIC, anon, authenticated;
