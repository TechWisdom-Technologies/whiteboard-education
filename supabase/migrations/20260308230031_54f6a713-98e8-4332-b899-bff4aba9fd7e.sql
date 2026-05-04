
-- Drop the broken trigger and function that depend on pg_net
DROP TRIGGER IF EXISTS on_new_lead_notify ON public.leads;
DROP FUNCTION IF EXISTS public.notify_new_lead();
