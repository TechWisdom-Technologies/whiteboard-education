-- Migration: Restructure and Align Production Supabase Database Schema
-- Generated: 2026-07-02
-- This script applies all updates made to public.language_centers, public.accommodations, and public.universities.

-- ==========================================
-- 1. Restructure public.language_centers
-- ==========================================
-- Drop legacy fields that do not exist or differ from development schema
ALTER TABLE public.language_centers DROP COLUMN IF EXISTS level CASCADE;
ALTER TABLE public.language_centers DROP COLUMN IF EXISTS duration CASCADE;
ALTER TABLE public.language_centers DROP COLUMN IF EXISTS tuition_fee CASCADE;
ALTER TABLE public.language_centers DROP COLUMN IF EXISTS overview CASCADE;
ALTER TABLE public.language_centers DROP COLUMN IF EXISTS institute CASCADE;
ALTER TABLE public.language_centers DROP COLUMN IF EXISTS curriculum CASCADE;
ALTER TABLE public.language_centers DROP COLUMN IF EXISTS intake_months CASCADE;

-- Add development schema fields
ALTER TABLE public.language_centers ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.language_centers ADD COLUMN IF NOT EXISTS logo_url text DEFAULT '';
ALTER TABLE public.language_centers ADD COLUMN IF NOT EXISTS about_text text DEFAULT '';
ALTER TABLE public.language_centers ADD COLUMN IF NOT EXISTS more_info jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.language_centers ADD COLUMN IF NOT EXISTS tuition_fees jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.language_centers ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.language_centers ADD COLUMN IF NOT EXISTS about_image_url text;

-- ==========================================
-- 2. Restructure public.accommodations
-- ==========================================
-- Add development schema fields
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS tag text DEFAULT '';
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS unit_types jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS travel_distance_time jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS available_room_types jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS room_rents jsonb DEFAULT '[]'::jsonb;

-- Drop obsolete fields (if needed to align schemas)
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS description CASCADE;
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS contact_email CASCADE;
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS contact_phone CASCADE;
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS travel_distance CASCADE;
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS latitude CASCADE;
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS longitude CASCADE;
ALTER TABLE public.accommodations DROP COLUMN IF EXISTS room_types CASCADE;

-- ==========================================
-- 3. Restructure public.universities (Drop unused columns)
-- ==========================================
ALTER TABLE public.universities DROP COLUMN IF EXISTS ranking CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS established CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS total_students CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS international_ratio CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS global_score CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS campus_size CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS latitude CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS longitude CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS study_reasons CASCADE;
ALTER TABLE public.universities DROP COLUMN IF EXISTS registration_steps CASCADE;
