import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";

const slugMappings = {
  'mmu-university': 'Multimedia University Malaysia (MMU)', 'ucsi-university': 'UCSI University Malaysia',
  'taylor-university-malaysia': 'Taylor\'s University Malaysia', 'apu-university': 'APU University Malaysia',
  'uniten-university': 'UNITEN University Malaysia', 'city-university': 'City University Malaysia',
  'cyberjaya-university': 'Cyberjaya University Malaysia (UoC)', 'mahsa-university': 'MAHSA University Malaysia',
  'utp-university': 'UTP University Malaysia', 'segi-university': 'SEGi University Malaysia',
  'limkokwing-university': 'Limkokwing University Malaysia', 'iukl-university': 'Infrastructure University Kuala Lumpur (IUKL)',
  'inti-university': 'INTI International University Malaysia', 'unikl-university': 'UniKL University Malaysia',
  'help-university': 'HELP University Malaysia', 'utar-university': 'Tunku Abdul Rahman University (UTAR)',
  'nottingham-university': 'Nottingham University Malaysia', 'monash-university': 'MONASH University Malaysia',
  'iumw-university': 'International University of Malaya-Wales (IUMW)', 'utm-university': 'UTM University Malaysia',
  'utem-university': 'UTeM University Malaysia', 'lincoln-university-college': 'Lincoln University College',
  'university-malaysia-of-computer-science-and-engineering-unimy': 'University Malaysia of Computer Science & Engineering (UNIMY)',
  'sunway-university': 'Sunway University', 'msu-university': 'Management and Science University (MSU)',
  'swinburne-university-of-technology-sarawak-campus': 'Swinburne University of Technology Sarawak Campus',
  'utm-space-university-malaysia': 'UTM SPACE University Malaysia', 'heriot-watt-university-malaysia-campus': 'Heriot-Watt University Malaysia Campus',
  'university-of-southampton': 'University of Southampton Malaysia', 'curtin-university-malaysia': 'Curtin University Malaysia',
  'xiamen-university-malaysia-campus': 'Xiamen University Malaysia Campus', 'international-medical-university': 'International Medical University (IMU)',
  'universiti-geomatika-malaysia': 'Universiti Geomatika Malaysia', 'nilai-university': 'NILAI University',
  'university-of-wollongong-uow': 'University of Wollongong (UOW) Malaysia', '-newcastle-university-medicine-malaysia': 'Newcastle University Medicine Malaysia (NUMed)',
  'universiti-malaya-um': 'Universiti Malaya (UM)', 'kings-university-college': 'Kings University College Malaysia',
  'binary-university': 'Binary University', 'tunku-abdul-rahman-university-of-management-and-technology-tar-umt': 'Tunku Abdul Rahman University of Management and Technology (TAR UMT)',
  'upm-university': 'Universiti Putra Malaysia (UPM)'
};

async function fetchPage(page) {
    const res = await fetch('https://en.your-uni.com/university-list?page=' + page);
    return res.text();
}

async function main() {
  console.log("Fetching logos from live website...");
  const map = {};
  for(let i=1; i<=4; i++) {
    const html = await fetchPage(i);
    const imgRegex = /<img[^>]+src=["'](https:\/\/en\.your-uni\.com\/assets\/images\/university\/([^"']+)\.webp[^"']*)["'][^>]*>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const url = match[1];
      const slug = match[2];
      const dbName = slugMappings[slug];
      if (dbName) {
        map[dbName] = url;
      }
    }
  }
  
  console.log(`Found logos for ${Object.keys(map).length} universities. Pushing to Supabase...`);
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/universities?select=id,name`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const unis = await res.json();
  
  const allSql = [];
  let updated = 0;
  for (const uni of unis) {
      if (map[uni.name]) {
          allSql.push(`UPDATE public.universities SET logo_url = '${map[uni.name]}' WHERE id = '${uni.id}';`);
          updated++;
      }
  }
  
  const path = join(__dirname, 'update-logos.sql');
  writeFileSync(path, allSql.join('\n'), 'utf8');
  console.log(`Generated SQL to update ${updated} logos at ${path}.`);
  
  // Actually update them directly using REST API
  for (const uni of unis) {
      if (map[uni.name]) {
          await fetch(`${SUPABASE_URL}/rest/v1/universities?id=eq.${uni.id}`, {
              method: 'PATCH',
              headers: {
                  apikey: SUPABASE_KEY, 
                  Authorization: `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': 'application/json',
                  Prefer: 'return=minimal'
              },
              body: JSON.stringify({ logo_url: map[uni.name] })
          });
      }
  }
  console.log("Successfully pushed logos directly to Supabase!");
}

main();
