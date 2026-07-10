import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://en.your-uni.com';

// PostgreSQL Connection Pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Fetch helper with retry logic
async function fetchHtml(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.text();
    } catch (err) {
      console.warn(`[Attempt ${attempt}/${retries}] Failed to fetch ${url}: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(2000 * attempt);
    }
  }
}

async function scrapeUniversityList() {
  console.log('Fetching university list...');
  const html = await fetchHtml(`${BASE_URL}/university-list`);
  const $ = cheerio.load(html);
  
  const universities = [];
  
  // Find all desktop university cards
  $('.uni-list-body').each((i, el) => {
    const linkEl = $(el).find('a[href^="university/"]').first();
    const name = linkEl.text().trim();
    const href = linkEl.attr('href');
    
    if (name && href) {
      const slug = href.replace('university/', '');
      
      // Extract city (e.g. from "Selangor,Malaysia")
      let city = 'Selangor';
      $(el).find('*').each((j, child) => {
        const text = $(child).text().trim();
        if (text.includes(',Malaysia') || text.includes(', Malaysia')) {
          city = text.split(',')[0].trim();
        }
      });
      
      if (!universities.some(u => u.slug === slug)) {
        universities.push({ name, slug, city });
      }
    }
  });
  
  console.log(`Found ${universities.length} universities in the list.`);
  return universities;
}

async function scrapeUniversityDetails(uni) {
  const url = `${BASE_URL}/university/${uni.slug}`;
  console.log(`Scraping details for: ${uni.name} (${url})...`);
  
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    
    // 0. Clean Name from H1
    const cleanName = $('.uni-name').first().text().trim() || uni.name;
    
    // 1. Logo URL
    let logoUrl = $('.uni-logo').first().attr('src') || '';
    if (logoUrl && !logoUrl.startsWith('http')) {
      logoUrl = `${BASE_URL}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
    }
    
    // 2. Hero Image
    let heroImage = $('.uni-details-body-img').first().attr('src') || '';
    if (heroImage && !heroImage.startsWith('http')) {
      heroImage = `${BASE_URL}${heroImage.startsWith('/') ? '' : '/'}${heroImage}`;
    }
    
    // 3. Description (text under "About [University]" heading)
    let description = '';
    const descHeading = $('h2').filter((i, el) => $(el).text().toLowerCase().includes('about'));
    if (descHeading.length > 0) {
      description = descHeading.next('.uni-details-body-content-text').text().trim()
        .replace(/\s+/g, ' '); // clean whitespace
    }
    
    // 4. About Text (text under "Study at [University]" heading)
    let aboutText = '';
    const aboutHeading = $('h2').filter((i, el) => $(el).text().toLowerCase().includes('study at'));
    if (aboutHeading.length > 0) {
      aboutText = aboutHeading.next('.uni-details-body-content-text').text().trim()
        .replace(/\s+/g, ' '); // clean whitespace
    }
    
    // 5. FAQs
    const faqs = [];
    $('.uni-details-body-content-faq .row.course-details-items').each((i, el) => {
      const question = $(el).find('button.course-details-item-collapse').text().trim();
      const answer = $(el).find('.faq-details').text().trim();
      if (question && answer) {
        faqs.push({
          question: question.replace(/\s+/g, ' '),
          answer: answer.replace(/\s+/g, ' ')
        });
      }
    });
    
    return {
      ...uni,
      name: cleanName,
      logo_url: logoUrl,
      hero_image: heroImage,
      description,
      about_text: aboutText,
      faqs
    };
  } catch (err) {
    console.error(`❌ Failed to scrape details for ${uni.name}: ${err.message}`);
    return null;
  }
}

async function main() {
  let client;
  try {
    // 1. Get list of universities
    const list = await scrapeUniversityList();
    if (list.length === 0) {
      console.error('No universities found to scrape. Aborting.');
      return;
    }
    
    // 2. Scrape details for each university
    const detailedUnis = [];
    for (const uni of list) {
      const details = await scrapeUniversityDetails(uni);
      if (details) {
        detailedUnis.push(details);
      }
      // Brief sleep to avoid hitting server too hard
      await sleep(1000);
    }
    
    console.log(`\nSuccessfully scraped ${detailedUnis.length} universities.`);
    
    // 3. Connect to local DB and insert data
    console.log('Connecting to Local PostgreSQL Database...');
    client = await pool.connect();
    
    // Clear old universities (which will cascade delete old courses/accommodations if they exist)
    console.log('Clearing old university entries...');
    await client.query('DELETE FROM public.universities');
    
    console.log('Inserting scraped universities...');
    const insertQuery = `
      INSERT INTO public.universities (name, country_id, city, logo_url, hero_image, description, about_text, faqs)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name
    `;
    
    const countryId = 'c0000000-0000-0000-0000-000000000001'; // Malaysia ID
    
    for (const uni of detailedUnis) {
      const result = await client.query(insertQuery, [
        uni.name,
        countryId,
        uni.city,
        uni.logo_url,
        uni.hero_image,
        uni.description,
        uni.about_text,
        JSON.stringify(uni.faqs)
      ]);
      console.log(`✅ Inserted: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }
    
    console.log('\n🎉 University scraping and database insertion completed successfully!');
    
  } catch (err) {
    console.error('Error in main flow:', err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
