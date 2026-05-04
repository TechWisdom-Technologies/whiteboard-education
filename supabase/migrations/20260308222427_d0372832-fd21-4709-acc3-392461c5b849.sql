
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS property_type text NOT NULL DEFAULT 'Residential',
  ADD COLUMN IF NOT EXISTS unit_types jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS room_types jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS travel_distance text DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_email text DEFAULT '';
