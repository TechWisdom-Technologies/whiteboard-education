import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const client = await pool.connect();
  console.log('Querying auth.users columns...');
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users';
    `);
    console.log(res.rows);
  } catch (err) {
    console.error('Error querying auth.users:', err);
  } finally {
    client.release();
    await pool.end();
  }
}
main();
