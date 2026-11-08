-- ═══════════════════════════════════════════════════════════════════
-- Migration: 20260801000009_safe_handle_new_user.sql
-- Description: Make handle_new_user() trigger exception-safe.
--              Prevents 500 Internal Server Error on /auth/v1/signup
--              if public.profiles encounters duplicate keys or conflicts.
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, ''), '@', 1))
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never let secondary profile table errors fail auth.users sign-up
    RETURN NEW;
END;
$$;

-- Ensure trigger exists and points to the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

