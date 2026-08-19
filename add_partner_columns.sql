ALTER TABLE partner_registrations
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS registration_number text,
ADD COLUMN IF NOT EXISTS agency_email text,
ADD COLUMN IF NOT EXISTS agency_phone text,
ADD COLUMN IF NOT EXISTS rep_email text,
ADD COLUMN IF NOT EXISTS rep_phone text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS youtube_url text;
