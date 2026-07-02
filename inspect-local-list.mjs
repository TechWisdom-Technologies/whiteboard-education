import * as cheerio from 'cheerio';
import fs from 'fs';

async function main() {
  const html = fs.readFileSync('Sample Inspects/Language Center/center list.html', 'utf8');
  const $ = cheerio.load(html);
  console.log(`Page Title: ${$('title').text()}`);
  console.log('All links containing text or href:');
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href || text) {
      console.log(`Href: "${href}" | Text: "${text}"`);
    }
  });
}
main();
