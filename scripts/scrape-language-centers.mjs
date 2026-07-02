import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import pg from 'pg';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

const BASE_URL = 'https://en.your-uni.com';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/See More|See Less/gi, '')
    .trim();
}

function extractTextUnderHeading($, headingText) {
  const header = $('h1, h2, h3, h4, h5, h6').filter((i, el) => {
    return $(el).text().toLowerCase().includes(headingText.toLowerCase());
  }).first();
  
  if (header.length === 0) return '';
  
  let nextNode = header.next();
  let htmlContent = '';
  while (nextNode.length > 0 && !/^h[1-6]$/i.test(nextNode[0].tagName)) {
    const clone = nextNode.clone();
    clone.find('.read-more-bar, .read-less-bar, .read-more-btn, .read-less-btn, button, a:contains("See More"), a:contains("See Less")').remove();
    htmlContent += $.html(clone);
    nextNode = nextNode.next();
  }
  
  let text = cheerio.load(htmlContent).text().trim();
  text = text.replace(/\s*\n\s*/g, '\n').replace(/\n{2,}/g, '\n\n').trim();
  // Remove "See More" and "See Less" strings
  text = text.replace(/See More|See Less/gi, '').trim();
  return text;
}

function extractFaqs($) {
  const faqs = [];
  
  // Method 1: Look for .faq-details or .faq-answer
  const faqDetails = $('.faq-details, .faq-answer');
  if (faqDetails.length > 0) {
    faqDetails.each((i, el) => {
      const answer = $(el).text().trim();
      if (!answer || answer.toLowerCase() === 'no data') return;
      
      let question = '';
      let prev = $(el).prev();
      if (prev.length > 0) {
        question = prev.text().trim();
      }
      
      if (!question && prev.length > 0) {
        question = $(el).prevAll('button, h3, h4, h5, h6, .faq-accordion, .faq-question').first().text().trim();
      }
      
      const cleanQ = cleanText(question);
      const cleanA = cleanText(answer);
      if (cleanQ && cleanA) {
        faqs.push({ question: cleanQ, answer: cleanA });
      }
    });
  }
  
  // Method 2: Elementor Accordion
  if (faqs.length === 0) {
    $('.elementor-accordion-item').each((i, el) => {
      const question = $(el).find('.elementor-accordion-title').text().trim();
      const answer = $(el).find('.elementor-tab-content').text().trim();
      const cleanQ = cleanText(question);
      const cleanA = cleanText(answer);
      if (cleanQ && cleanA) {
        faqs.push({ question: cleanQ, answer: cleanA });
      }
    });
  }

  // Method 3: General accordion or collapse items
  if (faqs.length === 0) {
    $('.accordion-item, .collapse-item').each((i, el) => {
      const question = $(el).find('.accordion-header, .collapse-header, button').first().text().trim();
      const answer = $(el).find('.accordion-content, .collapse-content, p').first().text().trim();
      const cleanQ = cleanText(question);
      const cleanA = cleanText(answer);
      if (cleanQ && cleanA) {
        faqs.push({ question: cleanQ, answer: cleanA });
      }
    });
  }
  
  return faqs;
}

async function main() {
  const client = await pool.connect();
  console.log('Connected to database for inserting scraped language centers...');
  
  let browser;
  try {
    // 1. Load the local center list file
    const listPath = join(__dirname, '../Sample Inspects/Language Center/center list.html');
    if (!fs.existsSync(listPath)) {
      throw new Error(`Local center list file not found at: ${listPath}`);
    }
    
    console.log(`Loading local center list from: ${listPath}`);
    const listHtml = fs.readFileSync(listPath, 'utf8');
    const $list = cheerio.load(listHtml);
    
    const centers = [];
    $list('a[href*="language-center/"]').each((i, el) => {
      const href = $list(el).attr('href') || '';
      const slugMatch = href.match(/language-center\/([^/]+)$/);
      if (slugMatch) {
        const slug = slugMatch[1].trim();
        if (slug === 'contact-us' || slug === 'blog' || slug === 'language-center-list' || slug === 'course-list' || slug === 'university-list') {
          return; // skip system links
        }
        
        const text = $list(el).text().trim();
        let city = 'Kuala Lumpur';
        if (text.toLowerCase().includes('selangor')) {
          city = 'Selangor';
        }
        
        if (!centers.some(c => c.slug === slug)) {
          centers.push({ slug, city, href });
        }
      }
    });
    
    console.log(`Parsed ${centers.length} language centers from local list.`);
    
    // 2. Launch Puppeteer browser
    console.log('Launching headless browser via Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const scrapedData = [];
    
    for (let i = 0; i < centers.length; i++) {
      const center = centers[i];
      console.log(`[${i + 1}/${centers.length}] Scraping: ${center.slug}...`);
      
      let html = '';
      
      // If it's bright-language-center, try loading local file first
      if (center.slug === 'bright-language-center') {
        const localBrightPath = join(__dirname, '../Sample Inspects/Language Center/bright-language-center.html');
        if (fs.existsSync(localBrightPath)) {
          console.log(`   Loading local bright-language-center HTML...`);
          html = fs.readFileSync(localBrightPath, 'utf8');
        }
      }
      
      // If not loaded locally, fetch via Puppeteer
      if (!html) {
        const detailUrl = `${BASE_URL}/language-center/${center.slug}`;
        try {
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          await page.goto(detailUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          html = await page.content();
          await page.close();
          await sleep(1500); // polite delay
        } catch (fetchErr) {
          console.error(`   Error loading ${detailUrl} via Puppeteer:`, fetchErr.message);
          continue;
        }
      }
      
      if (!html) {
        console.warn(`   No HTML content for ${center.slug}. Skipping.`);
        continue;
      }
      
      const $ = cheerio.load(html);
      
      // Extract data
      const name = cleanText($('h1').first().text()) || center.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Logo URL - prioritize img.uni-logo or the main header image container's logo
      let logo_url = null;
      const centerLogoImg = $('.uni-logo-container img.uni-logo, #eng-center-main-header img.uni-logo, img.uni-logo').first();
      if (centerLogoImg.length > 0) {
        logo_url = centerLogoImg.attr('src') || null;
      }
      
      if (!logo_url) {
        // Fallback search
        $('img').each((j, img) => {
          const src = $(img).attr('src') || '';
          if (src.includes('english-center') && !src.includes('logo.webp')) {
            logo_url = src;
            return false;
          }
        });
      }
      if (!logo_url) {
        logo_url = $('img').first().attr('src') || null;
      }
      if (logo_url && !logo_url.startsWith('http')) {
        logo_url = new URL(logo_url, BASE_URL).toString();
      }
      
      // About text
      const about_text = extractTextUnderHeading($, 'About');

      // About Image URL - from #uni-details-about-1 img.uni-details-body-img
      let about_image_url = null;
      const aboutImgElement = $('#uni-details-about-1 img.uni-details-body-img, .uni-details-body-content-about img.uni-details-body-img').first();
      if (aboutImgElement.length > 0) {
        about_image_url = aboutImgElement.attr('src') || null;
      }
      if (about_image_url && !about_image_url.startsWith('http')) {
        about_image_url = new URL(about_image_url, BASE_URL).toString();
      }
      
      // more_info
      const more_info = [];
      let inCoursesSection = false;
      $('h2').each((j, el) => {
        const text = cleanText($(el).text());
        if (text.toLowerCase().includes('about')) {
          inCoursesSection = true;
          return;
        }
        if (text.toLowerCase().includes('tuition fees') || text.toLowerCase().includes('registration steps') || text.toLowerCase().includes('frequently asked')) {
          inCoursesSection = false;
          return;
        }
        if (inCoursesSection) {
          let next = $(el).next();
          let descParts = [];
          while (next.length > 0 && !/^h[1-6]$/i.test(next[0].tagName)) {
            let txt = next.text().trim();
            if (txt) {
              // Clean "See More" and "See Less" text
              txt = txt.replace(/See More|See Less/gi, '').trim();
              if (txt) descParts.push(txt);
            }
            next = next.next();
          }
          more_info.push({
            title: text,
            description: descParts.join('\n\n')
          });
        }
      });
      
      // Tuition fees
      const tuition_fees = [];
      const feeTable = $('table').first();
      if (feeTable.length > 0) {
        feeTable.find('tr').each((j, tr) => {
          if (j === 0) return;
          const cells = [];
          $(tr).find('td').each((k, td) => {
            cells.push($(td).text().trim().replace(/\s+/g, ' '));
          });
          
          if (cells.length === 5) {
            // Clean table layout with spacer cells: [empty, duration, tuition_fee, visa, empty]
            tuition_fees.push({
              duration: cells[1],
              tuition_fee: cells[2],
              visa: cells[3]
            });
          } else if (cells.length >= 3) {
            // Layout without spacer cells: [duration, tuition_fee, visa]
            tuition_fees.push({
              duration: cells[0],
              tuition_fee: cells[1],
              visa: cells[2]
            });
          }
        });
      }
      
      // FAQs
      const faqs = extractFaqs($);
      
      scrapedData.push({
        name,
        slug: center.slug,
        city: center.city,
        logo_url,
        about_image_url,
        about_text,
        more_info,
        tuition_fees,
        faqs
      });
      
      console.log(`   Success: "${name}" | Logo: ${logo_url ? 'Yes' : 'No'} | About Img: ${about_image_url ? 'Yes' : 'No'} | Info blocks: ${more_info.length} | Fees: ${tuition_fees.length} | FAQs: ${faqs.length}`);
    }
    
    // 3. Save to database
    console.log(`\nSaving ${scrapedData.length} centers to database...`);
    for (const data of scrapedData) {
      await client.query(
        `INSERT INTO public.language_centers (name, slug, city, logo_url, about_image_url, about_text, more_info, tuition_fees, faqs)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name,
             city = EXCLUDED.city,
             logo_url = EXCLUDED.logo_url,
             about_image_url = EXCLUDED.about_image_url,
             about_text = EXCLUDED.about_text,
             more_info = EXCLUDED.more_info,
             tuition_fees = EXCLUDED.tuition_fees,
             faqs = EXCLUDED.faqs,
             updated_at = NOW()`,
        [
          data.name,
          data.slug,
          data.city,
          data.logo_url,
          data.about_image_url,
          data.about_text,
          JSON.stringify(data.more_info),
          JSON.stringify(data.tuition_fees),
          JSON.stringify(data.faqs)
        ]
      );
      console.log(`[DB SUCCESS] Saved/Updated: ${data.name}`);
    }
    
    console.log('\nScraping and database update completed successfully!');
  } catch (err) {
    console.error('Fatal error during execution:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
    client.release();
    await pool.end();
  }
}

main();
