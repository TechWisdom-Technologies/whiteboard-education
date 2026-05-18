-- Migration to add message column to leads table
ALTER TABLE public.leads
ADD COLUMN message TEXT DEFAULT '';
