import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://en.your-uni.com/university/mmu-university/bachelor-of-accounting-hons';
  console.log('Fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== ACCORDION ITEMS ===');
  $('.elementor-accordion-item, .accordion-item, .card, [class*="accordion"]').each((i, el) => {
    console.log(`Item ${i}: class="${$(el).attr('class')}" id="${$(el).attr('id')}"`);
    console.log('Text:', $(el).text().trim().substring(0, 100));
  });

  console.log('\n=== HEADINGS ===');
  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    console.log(`${el.tagName}: "${$(el).text().trim()}"`);
  });
}

main().catch(console.error);
