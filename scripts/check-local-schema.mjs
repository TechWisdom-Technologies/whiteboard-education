import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const client = await pool.connect();
  try {
    const resUnis = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'universities' AND table_schema = 'public'
    `);
    console.log('=== UNIVERSITIES COLUMNS ===');
    console.log(resUnis.rows.map(r => `${r.column_name} (${r.data_type})`).join('\n'));

    const resCourses = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'courses' AND table_schema = 'public'
    `);
    console.log('\n=== COURSES COLUMNS ===');
    console.log(resCourses.rows.map(r => `${r.column_name} (${r.data_type})`).join('\n'));

    const resAcc = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'accommodations' AND table_schema = 'public'
    `);
    console.log('\n=== ACCOMMODATIONS COLUMNS ===');
    console.log(resAcc.rows.map(r => `${r.column_name} (${r.data_type})`).join('\n'));

  } finally {
    client.release();
    await pool.end();
  }
}

main();
