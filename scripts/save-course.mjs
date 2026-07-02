import fs from 'fs';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function main() {
  const url = 'https://en.your-uni.com/university/tunku-abdul-rahman-university-of-management-and-technology-tar-umt/doctor-of-philosophy-in-computer-science-by-research-mode';
  console.log('Fetching', url);
  const res = await fetch(url, { headers: FETCH_HEADERS });
  const html = await res.text();
  
  // Ensure directory exists
  fs.mkdirSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Courses', { recursive: true });
  fs.writeFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Courses/tar-umt-phd-cs.html', html, 'utf8');
  console.log('Saved to Sample Inspects/Courses/tar-umt-phd-cs.html');
}

main();
