import * as cheerio from 'cheerio';

async function inspect(slug) {
  const url = `https://en.your-uni.com/language-center/${slug}`;
  console.log(`\n==================================================\nINSPECTING: ${slug} (${url})\n==================================================`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      return;
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    console.log('--- HEADINGS ---');
    $('h1, h2, h3, h4').each((i, el) => {
      console.log(`${el.tagName}: ${$(el).text().trim()}`);
    });

    console.log('\n--- TABLES ---');
    $('table').each((i, el) => {
      console.log(`Table ${i}:`);
      $(el).find('tr').slice(0, 3).each((j, tr) => {
        const cells = [];
        $(tr).find('th, td').each((k, td) => {
          cells.push($(td).text().trim().replace(/\s+/g, ' '));
        });
        console.log(`  Row ${j}:`, cells.join(' | '));
      });
    });

  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function main() {
  const slugs = ['elec', 'californiakl', 'ems', 'els'];
  for (const slug of slugs) {
    await inspect(slug);
  }
}

main();
