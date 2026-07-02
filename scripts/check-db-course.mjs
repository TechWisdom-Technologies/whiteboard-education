import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT c.*, u.name as uni_name 
      FROM public.courses c
      JOIN public.universities u ON c.university_id = u.id
      WHERE u.name ILIKE '%Tunku Abdul Rahman%' AND c.title ILIKE '%Computer Science%'
    `);
    
    console.log(`Found ${res.rows.length} courses:`);
    for (const row of res.rows) {
      console.log('---');
      console.log('ID:', row.id);
      console.log('Title:', row.title);
      console.log('Uni Name:', row.uni_name);
      console.log('Tuition Fee:', row.tuition_fee);
      console.log('Duration:', row.duration);
      console.log('Intake Months:', JSON.stringify(row.intake_months));
      console.log('Overview (length):', row.overview ? row.overview.length : 0);
      console.log('Overview snippet:', row.overview ? row.overview.substring(0, 200) : 'null');
      console.log('Curriculum:', JSON.stringify(row.curriculum));
      console.log('Entry Requirements:', JSON.stringify(row.entry_requirements));
      console.log('Entry Requirements Text:', row.entry_requirements_text ? row.entry_requirements_text.substring(0, 200) : 'null');
      console.log('Career Outcomes:', JSON.stringify(row.career_outcomes));
      console.log('Offer Letter:', row.offer_letter);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main();
