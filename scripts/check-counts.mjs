import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const client = await pool.connect();
  try {
    const uni = await client.query('SELECT COUNT(*) FROM public.universities');
    const courses = await client.query('SELECT COUNT(*) FROM public.courses');
    const partners = await client.query('SELECT COUNT(*) FROM public.partner_registrations');
    const students = await client.query('SELECT COUNT(*) FROM public.students');
    const blogs = await client.query('SELECT COUNT(*) FROM public.blogs');
    
    console.log('--- Database Counts ---');
    console.log('Universities:', uni.rows[0].count);
    console.log('Courses:', courses.rows[0].count);
    console.log('Partners:', partners.rows[0].count);
    console.log('Students:', students.rows[0].count);
    console.log('Blogs:', blogs.rows[0].count);
  } catch (err) {
    console.error('Error querying counts:', err);
  } finally {
    client.release();
    await pool.end();
  }
}
main();
