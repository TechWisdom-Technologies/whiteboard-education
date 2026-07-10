import fs from 'fs';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function main() {
  const url = 'https://en.your-uni.com/university-list';
  console.log('Fetching', url);
  const res = await fetch(url, { headers: FETCH_HEADERS });
  const html = await res.text();
  
  fs.writeFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Universities/university-list.html', html, 'utf8');
  console.log('Saved to Sample Inspects/Universities/university-list.html');
}

main();
