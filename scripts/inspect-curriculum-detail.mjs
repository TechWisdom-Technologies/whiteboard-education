import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://en.your-uni.com/university/mmu-university/bachelor-of-accounting-hons';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== CURRICULUM NEXT SIBLING HTML ===');
  const currHeader = $('h1, h2, h3, h4, h5, h6').filter((i, el) => {
    return $(el).text().trim().toLowerCase() === 'curriculum';
  }).first();

  if (currHeader.length > 0) {
    const next = currHeader.next();
    console.log('Next sibling tag:', next[0]?.tagName, 'class:', next.attr('class'));
    console.log('Next sibling HTML (first 2000 chars):');
    console.log(next.html()?.substring(0, 2000));
  }
}

main().catch(console.error);
