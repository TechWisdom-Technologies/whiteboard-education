import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://en.your-uni.com/university/mmu-university/bachelor-of-accounting-hons';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== YEAR 1 NEIGHBORHOOD HTML ===');
  const year1Header = $('h1, h2, h3, h4, h5, h6').filter((i, el) => {
    return $(el).text().trim().toLowerCase() === 'year 1';
  }).first();

  if (year1Header.length > 0) {
    console.log('Found Year 1 header. Next siblings:');
    let nextNode = year1Header.next();
    let count = 0;
    while (nextNode.length > 0 && count < 5) {
      console.log(`Sibling ${count}: <${nextNode[0].tagName}> class="${nextNode.attr('class') || ''}"`);
      console.log('HTML:', nextNode.html()?.substring(0, 500));
      nextNode = nextNode.next();
      count++;
    }
  } else {
    console.log('Year 1 header not found!');
  }
}

main().catch(console.error);
