import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  console.log('Connecting to database...');
  const client = await pool.connect();
  
  try {
    console.log('Altering public.universities table...');
    
    // Drop columns not needed by the user
    const dropColumns = [
      'ranking',
      'global_score',
      'study_reasons',
      'registration_steps',
      'total_students',
      'international_ratio',
      'established',
      'campus_size'
    ];
    
    for (const col of dropColumns) {
      await client.query(`ALTER TABLE public.universities DROP COLUMN IF EXISTS ${col} CASCADE`);
      console.log(`- Dropped column: ${col}`);
    }
    
    console.log('\nVerifying current columns in public.universities:');
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'universities'
      ORDER BY ordinal_position
    `);
    
    res.rows.forEach(row => {
      console.log(`  * ${row.column_name} (${row.data_type})`);
    });
    
    console.log('\nSchema updated successfully!');
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
