import fs from 'fs';
import * as cheerio from 'cheerio';

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

async function main() {
  const url = 'https://en.your-uni.com/university-list';
  console.log('Fetching', url);
  const res = await fetch(url, { headers: FETCH_HEADERS });
  const html = await res.text();
  
  const $ = cheerio.load(html);
  
  console.log('Title:', $('title').text());
  console.log('Body class:', $('body').attr('class') || $('body').attr('id'));
  
  // Let's print some links containing /university/
  console.log('\nLinks containing /university/:');
  $('a[href*="/university/"]').each((i, el) => {
    console.log(`Link [${i}]: href="${$(el).attr('href')}" text="${$(el).text().trim()}"`);
  });

  // Let's print the first 10 div classes
  console.log('\nFirst 20 div classes:');
  $('div').slice(0, 40).each((i, el) => {
    console.log(`div [${i}]: class="${$(el).attr('class')}" id="${$(el).attr('id')}"`);
  });
}

main();
