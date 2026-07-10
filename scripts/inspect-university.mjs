import fs from 'fs';
import * as cheerio from 'cheerio';

// 1. Inspect University List (to get city and other list-level info)
const listHtml = fs.readFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Universities/university-list.html', 'utf8');
const $list = cheerio.load(listHtml);

console.log('=== UNIVERSITY LIST INSPECTION ===');
$list('.elementor-post, .university-card, .university-list-item, [class*="university"]').each((i, el) => {
  const text = $list(el).text().trim().replace(/\s+/g, ' ');
  if (text.includes('Multimedia University') || text.includes('MMU')) {
    console.log(`Match ${i}: class="${$list(el).attr('class')}"`);
    console.log(`Content snippet: "${text.substring(0, 200)}"`);
  }
});

// Let's print some sample elements from the list page to find the card selector
console.log('\nSample card-like elements:');
$list('div').each((i, el) => {
  const className = $list(el).attr('class') || '';
  if (className.includes('card') || className.includes('post') || className.includes('item') || className.includes('box')) {
    const text = $list(el).text().trim().replace(/\s+/g, ' ');
    if (text.includes('Malaysia') && text.length < 300) {
      console.log(`div class="${className}": "${text}"`);
    }
  }
});

// 2. Inspect University Detail (mmu-university.html)
const detailHtml = fs.readFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Universities/mmu-university.html', 'utf8');
const $detail = cheerio.load(detailHtml);

console.log('\n=== UNIVERSITY DETAIL INSPECTION ===');
console.log('Title (H1):', $detail('h1').text().trim());

// Logo
console.log('Logo URL:', $detail('img[src*="logo"], img[src*="webp"]').first().attr('src'));

// Description/Meta description
console.log('Meta Description:', $detail('meta[name="description"]').attr('content'));

// Hero image (often the first big banner image or background image)
console.log('Hero Image Candidate 1:', $detail('.elementor-background-overlay, .uni-details-hero, [class*="hero"], [class*="banner"]').first().css('background-image'));
$detail('img').each((i, el) => {
  const src = $detail(el).attr('src') || '';
  if (src.includes('banner') || src.includes('hero') || src.includes('background') || src.includes('cover')) {
    console.log(`Hero Image Candidate (img): ${src}`);
  }
});

// About Text
console.log('\nAbout Text Container Search:');
$detail('h2, h3').each((i, el) => {
  const text = $detail(el).text().trim();
  if (text.toLowerCase().includes('about') || text.toLowerCase().includes('study at') || text.toLowerCase().includes('introduction')) {
    console.log(`Heading: "${text}"`);
    // Print next few paragraphs
    let nextNode = $detail(el).next();
    let count = 0;
    while (nextNode.length > 0 && count < 3) {
      console.log(`  Sibling [${nextNode[0].tagName}]: "${nextNode.text().trim().substring(0, 150)}..."`);
      nextNode = nextNode.next();
      count++;
    }
  }
});

// FAQs
console.log('\nFAQs Search:');
$detail('.elementor-accordion-item, .accordion-item, [class*="faq"]').each((i, el) => {
  const text = $detail(el).text().trim().replace(/\s+/g, ' ');
  if (text.length < 200) {
    console.log(`FAQ element: class="${$detail(el).attr('class')}" text="${text}"`);
  }
});
