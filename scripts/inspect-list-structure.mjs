import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Universities/university-list.html', 'utf8');
const $ = cheerio.load(html);

console.log('=== ALL LINKS ===');
const links = [];
$('a').each((i, el) => {
  const href = $(el).attr('href');
  const text = $(el).text().trim().replace(/\s+/g, ' ');
  if (href) {
    links.push({ href, text });
  }
});
console.log(`Total links found: ${links.length}`);
console.log('Sample links (first 20):');
console.log(links.slice(0, 20));

console.log('\n=== LINKS CONTAINING "university" ===');
const uniLinks = links.filter(l => l.href.includes('university'));
console.log(`Total university links: ${uniLinks.length}`);
console.log(uniLinks.slice(0, 30));

console.log('\n=== DIV STRUCTURE ===');
// Let's find any divs that look like university cards
const cardDivs = $('div').filter((i, el) => {
  const className = $(el).attr('class') || '';
  return className.includes('card') || className.includes('item') || className.includes('uni');
});
console.log(`Total card/item/uni divs: ${cardDivs.length}`);
cardDivs.slice(0, 10).each((i, el) => {
  console.log(`div [${i}]: class="${$(el).attr('class')}" text="${$(el).text().trim().substring(0, 60)}..."`);
});
