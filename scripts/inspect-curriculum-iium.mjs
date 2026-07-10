import * as cheerio from 'cheerio';

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      console.log(`Fetch failed with status ${res.status}. Retrying...`);
    } catch (err) {
      console.log(`Fetch attempt ${i + 1} failed: ${err.message}. Retrying...`);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
}

async function main() {
  const url = 'https://en.your-uni.com/university/iium-university/master-in-business-intelligence-and-analytics-by-coursework';
  console.log('Fetching', url);
  const res = await fetchWithRetry(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const button = $('.course-details-item-collapse').filter((i, el) => {
    return $(el).text().toLowerCase().includes('curriculum');
  }).first();

  if (button.length > 0) {
    console.log('Found button!');
    // Print next sibling
    const sibling = button.next();
    console.log('Sibling Tag:', sibling[0]?.tagName, 'Class:', sibling.attr('class') || '');
    console.log('Sibling HTML (first 3000 chars):');
    console.log(sibling.html()?.substring(0, 3000));
  } else {
    console.log('Curriculum button not found!');
  }
}

main().catch(console.error);
