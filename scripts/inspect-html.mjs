import fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = 'd:/Coding/Fidbi/whiteboard-education/Sample Inspects/Universities/mmu-university.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

console.log('=== DETAILED FAQ INSPECT ===');
// Let's find the FAQ section
const faqSection = $('.uni-details-body-content-faq');
if (faqSection.length > 0) {
  // Let's print all children elements and their classes
  faqSection.find('*').each((i, el) => {
    const tagName = el.tagName;
    const className = $(el).attr('class') || '';
    const id = $(el).attr('id') || '';
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    
    // Only print interesting elements to keep it clean
    if (['h3', 'h4', 'div', 'p', 'button', 'a'].includes(tagName) && className) {
      console.log(`${tagName} | class="${className}" | id="${id}" | text (first 60 chars): "${text.substring(0, 60)}"`);
    }
  });

  // Let's try a specific extraction logic:
  console.log('\n--- EXTRACTED FAQS ---');
  const faqs = [];
  // Often FAQs are structured with a question button/header and an answer div
  // Let's see if there are buttons or headers for questions
  faqSection.find('.faq-details, [id^="faq-details"]').each((i, el) => {
    // Let's see what is inside this element or its siblings
    console.log(`FAQ Element [${i}]: class="${$(el).attr('class')}"`);
    const questionText = $(el).prev().text().trim().replace(/\s+/g, ' ');
    const answerText = $(el).text().trim().replace(/\s+/g, ' ');
    console.log(`  Q: ${questionText}`);
    console.log(`  A: ${answerText}`);
  });
} else {
  console.log('FAQ section not found');
}
