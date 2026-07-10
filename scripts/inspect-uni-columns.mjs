import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const client = await pool.connect();
  console.log('Querying public.universities columns...');
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'universities';
    `);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`));
  } catch (err) {
    console.error('Error querying columns:', err);
  } finally {
    client.release();
    await pool.end();
  }
}
main();
