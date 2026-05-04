import { createClient } from '@supabase/supabase-js';

// We need to read the env vars from .env.local
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');

const envFile = readFileSync(envPath, 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim().replace(/"/g, '');
  if (line.startsWith('VITE_SUPABASE_PUBLISHABLE_KEY=')) supabaseKey = line.split('=')[1].trim().replace(/"/g, '');
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: universities, error: uniError } = await supabase.from('universities').select('id, name');
  if (uniError) return console.error(uniError);
  
  const { data: courses, error: courseError } = await supabase.from('courses').select('id, university_id');
  if (courseError) return console.error(courseError);
  
  const counts = {};
  let nullCount = 0;
  
  for (const c of courses) {
    if (!c.university_id) {
      nullCount++;
      continue;
    }
    const uni = universities.find(u => u.id === c.university_id);
    const name = uni ? uni.name : 'UNKNOWN ID ' + c.university_id;
    counts[name] = (counts[name] || 0) + 1;
  }
  
  console.log(`Total courses in DB: ${courses.length}`);
  console.log(`Courses with NULL university_id: ${nullCount}`);
  
  console.log('--- Course Counts per University ---');
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  for (const [name, count] of sorted) {
    console.log(`${name}: ${count}`);
  }
}

check();
