-- Create the account_managers table
CREATE TABLE IF NOT EXISTS public.account_managers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.account_managers ENABLE ROW LEVEL SECURITY;

-- Create policies (assuming admin has full access and public/partner can read)
CREATE POLICY "Enable read access for all users" ON public.account_managers
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated admins" ON public.account_managers
    FOR ALL USING (auth.role() = 'authenticated');

-- Extract data from platform_settings and insert into account_managers
DO $$
DECLARE
    managers_json JSONB;
    manager JSONB;
BEGIN
    -- Get the JSON array from platform_settings
    SELECT value INTO managers_json
    FROM public.platform_settings
    WHERE key = 'account_manager';

    IF managers_json IS NOT NULL THEN
        -- Loop through the JSON array and insert each object
        FOR manager IN SELECT * FROM jsonb_array_elements(managers_json)
        LOOP
            INSERT INTO public.account_managers (id, name, title, email, phone, photo_url)
            VALUES (
                uuid_generate_v4(),
                manager->>'name',
                manager->>'title',
                manager->>'email',
                manager->>'phone',
                manager->>'photo_url'
            );
        END LOOP;
    END IF;
END $$;
