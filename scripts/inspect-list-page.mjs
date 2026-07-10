import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://en.your-uni.com/language-center-list';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== PAGE HTML SUMMARY ===');
  console.log('Body length:', html.length);
  
  console.log('\n=== ALL LINKS ===');
  const links = [];
  $('a').each((i, el) => {
    links.push({
      text: $(el).text().trim().replace(/\s+/g, ' '),
      href: $(el).attr('href') || ''
    });
  });
  console.log('Total links:', links.length);
  console.log(JSON.stringify(links.slice(0, 30), null, 2));

  console.log('\n=== SOME HEADINGS ===');
  $('h1, h2, h3, h4').each((i, el) => {
    console.log(`${el.tagName}: ${$(el).text().trim()}`);
  });
}

main().catch(console.error);
