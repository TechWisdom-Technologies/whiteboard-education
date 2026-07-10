import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const client = await pool.connect();
  console.log('Connected to database. Running migration...');
  try {
    await client.query('BEGIN');

    // 1. Drop existing table
    console.log('Dropping existing public.language_centers table...');
    await client.query('DROP TABLE IF EXISTS public.language_centers CASCADE;');

    // 2. Create new table
    console.log('Creating new public.language_centers table...');
    await client.query(`
      CREATE TABLE public.language_centers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL DEFAULT '',
        logo_url TEXT,
        about_text TEXT,
        courses JSONB DEFAULT '[]'::jsonb,      -- array of { title, description }
        tuition_fees JSONB DEFAULT '[]'::jsonb, -- array of { duration, tuition_fee, visa }
        faqs JSONB DEFAULT '[]'::jsonb,         -- array of { question, answer }
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 3. Create update trigger
    console.log('Creating update trigger...');
    await client.query(`
      DROP TRIGGER IF EXISTS update_language_centers_updated_at ON public.language_centers;
      CREATE TRIGGER update_language_centers_updated_at
        BEFORE UPDATE ON public.language_centers
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    `);

    // 4. Enable Row Level Security (RLS)
    console.log('Enabling Row Level Security...');
    await client.query('ALTER TABLE public.language_centers ENABLE ROW LEVEL SECURITY;');

    // 5. Create Policies
    console.log('Creating security policies...');
    await client.query(`
      CREATE POLICY "Public read language_centers" 
        ON public.language_centers FOR SELECT TO PUBLIC USING (true);
    `);
    await client.query(`
      CREATE POLICY "Admin manage language_centers" 
        ON public.language_centers FOR ALL 
        USING (public.has_role(auth.uid(), 'admin')) 
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    `);

    await client.query('COMMIT');
    console.log('Migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
