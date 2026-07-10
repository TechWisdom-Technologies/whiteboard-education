import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Universities/mmu-university.html', 'utf8');
const $ = cheerio.load(html);

console.log('=== FAQ HTML STRUCTURE ===');
const faqSection = $('.uni-details-body-content-faq, [class*="faq"]');
console.log('Found FAQ sections:', faqSection.length);

faqSection.each((i, sec) => {
  console.log(`Section ${i} class:`, $(sec).attr('class'));
  // Print first 1000 characters of the section HTML
  console.log($(sec).html().substring(0, 1000));
});
