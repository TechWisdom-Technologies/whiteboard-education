import dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    const res = await fetch('http://localhost:5001/api/partner_registrations');
    const partners = await res.json();
    console.log('API /api/partner_registrations returns:', partners.length, partners);
    
    const sres = await fetch('http://localhost:5001/api/students');
    const students = await sres.json();
    console.log('API /api/students returns:', students.length, students);

    const bres = await fetch('http://localhost:5001/api/blogs');
    const blogs = await bres.json();
    console.log('API /api/blogs returns:', blogs.length, blogs);
  } catch (err) {
    console.error('Error fetching API:', err);
  }
}
main();
