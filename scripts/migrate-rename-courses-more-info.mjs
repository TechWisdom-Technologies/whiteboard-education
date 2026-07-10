import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const client = await pool.connect();
  console.log('Connected to database. Running migration to rename columns...');
  try {
    await client.query('BEGIN');

    // 1. Rename column courses to more_info if it exists and more_info does not
    console.log('Checking and renaming column courses to more_info...');
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = 'language_centers' 
            AND column_name = 'courses'
        ) AND NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = 'language_centers' 
            AND column_name = 'more_info'
        ) THEN
          ALTER TABLE public.language_centers RENAME COLUMN courses TO more_info;
        END IF;
      END $$;
    `);

    // 2. Add about_image_url column if it does not exist
    console.log('Checking and adding column about_image_url...');
    await client.query(`
      ALTER TABLE public.language_centers 
      ADD COLUMN IF NOT EXISTS about_image_url TEXT;
    `);

    await client.query('COMMIT');
    console.log('Schema migration completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Schema migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
