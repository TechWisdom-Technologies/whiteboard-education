import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Courses/tar-umt-phd-cs.html', 'utf8');
const $ = cheerio.load(html);

console.log('=== SEARCHING FOR FEES IN HTML ===');
// Search for any text containing numbers in the tables
$('table').each((i, table) => {
  console.log(`Table ${i}:`);
  console.log($(table).html());
});
