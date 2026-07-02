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
  const url = 'https://en.your-uni.com/language-center-list';
  console.log('Fetching list from', url);
  const res = await fetchWithRetry(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== LANGUAGE CENTERS FOUND ===');
  const centers = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('/language-center/')) {
      const name = $(el).text().trim() || $(el).find('h3, h4, h5, p, span').text().trim();
      centers.push({ name, href });
    }
  });

  // Unique by href
  const uniqueCenters = [];
  const seen = new Set();
  for (const c of centers) {
    if (!seen.has(c.href)) {
      seen.add(c.href);
      uniqueCenters.push(c);
    }
  }

  console.log(`Total unique centers found: ${uniqueCenters.length}`);
  console.log(JSON.stringify(uniqueCenters, null, 2));
}

main().catch(console.error);
