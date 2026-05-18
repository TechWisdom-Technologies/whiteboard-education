-- Migration to cascade delete from auth.users to user_roles and partner_registrations
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.partner_registrations
DROP CONSTRAINT IF EXISTS partner_registrations_user_id_fkey;

ALTER TABLE public.partner_registrations
ADD CONSTRAINT partner_registrations_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE public.partner_notifications
DROP CONSTRAINT IF EXISTS partner_notifications_partner_id_fkey;

ALTER TABLE public.partner_notifications
ADD CONSTRAINT partner_notifications_partner_id_fkey
FOREIGN KEY (partner_id) REFERENCES auth.users(id)
ON DELETE CASCADE;
