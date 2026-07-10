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
  const url = 'https://en.your-uni.com/language-center/bright-language-center';
  console.log('Fetching', url);
  const res = await fetchWithRetry(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== PAGE TITLE ===');
  console.log($('title').text().trim());

  console.log('\n=== HEADINGS ===');
  $('h1, h2, h3, h4, h5').each((i, el) => {
    console.log(`${el.tagName}: ${$(el).text().trim()}`);
  });

  console.log('\n=== TABLES ===');
  $('table').each((i, el) => {
    console.log(`\nTable ${i}:`);
    const rows = [];
    $(el).find('tr').each((rj, tr) => {
      const cells = [];
      $(tr).find('td, th').each((ck, td) => {
        cells.push($(td).text().trim().replace(/\s+/g, ' '));
      });
      rows.push(cells);
    });
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
    if (rows.length > 5) console.log(`... and ${rows.length - 5} more rows`);
  });

  console.log('\n=== FAQS ===');
  $('.faq-item, [class*="faq"]').each((i, el) => {
    console.log(`FAQ ${i}:`, $(el).text().trim().replace(/\s+/g, ' '));
  });
}

main().catch(console.error);
