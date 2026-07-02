import * as cheerio from 'cheerio';
import pg from 'pg';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

const BASE_URL = 'https://en.your-uni.com';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      console.log(`Fetch failed with status ${res.status}. Retrying...`);
    } catch (err) {
      console.log(`Fetch attempt ${i + 1} failed: ${err.message}. Retrying...`);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} attempts.`);
}

async function scrapeUniversityAccommodations(uniSlug) {
  const url = `${BASE_URL}/university/${uniSlug}/accommodation`;
  console.log(`Fetching accommodations for: ${url}`);
  
  let html = '';
  try {
    const res = await fetchWithRetry(url);
    html = await res.text();
  } catch (err) {
    console.error(`Error fetching accommodations for ${uniSlug}: ${err.message}`);
    return [];
  }

  const $ = cheerio.load(html);
  const accommodations = [];

  $('.accommodation-list-item').each((i, itemEl) => {
    // 1. Basic Info
    const name = cleanText($(itemEl).find('.accom-name').text());
    const tag = cleanText($(itemEl).find('.accom-tag').text());
    const address = cleanText($(itemEl).find('address').text());
    
    if (!name) return;

    // Parse City from Address
    let city = 'Selangor';
    if (address) {
      const parts = address.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1].toLowerCase();
        const secondLast = parts[parts.length - 2];
        if (lastPart.includes('malaysia') || lastPart.includes('my')) {
          city = secondLast;
        } else {
          city = parts[parts.length - 1];
        }
      }
    }

    // 2. Property Type and Unit Types
    let propertyType = 'Apartment';
    let unitTypes = [];
    $(itemEl).find('.accom-info-property-item').each((j, propEl) => {
      const title = cleanText($(propEl).find('.accom-info-title').text()).toLowerCase();
      const val = cleanText($(propEl).find('.accom-info-value').text());
      if (title.includes('property type')) {
        propertyType = val;
      } else if (title.includes('unit types')) {
        unitTypes = val.split(',').map(s => s.trim()).filter(Boolean);
      }
    });

    // 3. Travel Distance / Time
    const travelDistanceTime = {};
    const travelTitleEl = $(itemEl).find('.accom-info-general').filter((j, genEl) => {
      return $(genEl).find('.accom-info-title').text().toLowerCase().includes('travel distance');
    });
    if (travelTitleEl.length > 0) {
      travelTitleEl.find('.accom-info-general-value-item').each((j, travelEl) => {
        const iconAlt = $(travelEl).find('img').attr('alt') || '';
        const iconSrc = $(travelEl).find('img').attr('src') || '';
        const text = cleanText($(travelEl).text());
        
        if (iconAlt.includes('walking') || iconSrc.includes('distance')) {
          travelDistanceTime.walking = text;
        } else if (iconAlt.includes('car') || iconSrc.includes('car')) {
          travelDistanceTime.car = text;
        } else if (iconAlt.includes('bus') || iconSrc.includes('bus')) {
          travelDistanceTime.bus = text;
        }
      });
    }

    // 4. Amenities
    const amenities = [];
    const amenitiesTitleEl = $(itemEl).find('.accom-info-general').filter((j, genEl) => {
      return $(genEl).find('.accom-info-title').text().toLowerCase().includes('amenities');
    });
    if (amenitiesTitleEl.length > 0) {
      amenitiesTitleEl.find('.accom-info-general-value-item').each((j, amenEl) => {
        const text = cleanText($(amenEl).text());
        if (text) {
          amenities.push(text);
        }
      });
    }

    // 5. Image URLs
    const image_urls = [];
    // Select images in the first row (the main accommodation image carousel)
    $(itemEl).find('.accommodation-list-item-row .swiper-slide img').each((j, imgEl) => {
      let src = $(imgEl).attr('src') || '';
      if (src && !src.startsWith('data:')) {
        if (!src.startsWith('http')) {
          src = `${BASE_URL}/${src.replace(/^\//, '')}`;
        }
        image_urls.push(src);
      }
    });
    const image_url = image_urls[0] || null;

    // 6. Room Types and Rents
    const room_rents = [];
    const available_room_types = [];
    $(itemEl).find('.accom-info-carousel .swiper-slide').each((j, slideEl) => {
      const roomType = cleanText($(slideEl).find('.accom-info-title').text());
      const rentNumber = cleanText($(slideEl).find('.currency-number').text());
      const rentCurrency = cleanText($(slideEl).find('.currency-text').text()) || 'MYR';
      
      if (roomType && rentNumber) {
        const rent = `${rentCurrency} ${rentNumber}`;
        room_rents.push({ room_type: roomType, rent });
        available_room_types.push(roomType);
      }
    });

    // Calculate minimum rent for price_per_month
    let price_per_month = 0;
    const prices = room_rents.map(r => {
      const match = r.rent.match(/\d[\d,.]*/);
      if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
      }
      return null;
    }).filter(p => p !== null);
    if (prices.length > 0) {
      price_per_month = Math.min(...prices);
    }

    accommodations.push({
      name,
      tag,
      address,
      city,
      type: propertyType,
      unit_types: unitTypes,
      travel_distance_time: travelDistanceTime,
      amenities,
      image_url,
      image_urls,
      available_room_types,
      room_rents,
      price_per_month
    });
  });

  return accommodations;
}

async function main() {
  const isTest = process.argv.includes('--test');
  console.log(`Running accommodation scraper in ${isTest ? 'TEST' : 'FULL'} mode...`);

  const client = await pool.connect();
  try {
    // Get universities from DB
    const resUnis = await client.query('SELECT id, name FROM public.universities');
    const dbUnis = resUnis.rows;
    console.log(`Loaded ${dbUnis.length} universities from database.`);

    // Load universities.json to get the slugs
    const fs = await import('fs');
    const path = await import('path');
    const fileURLToPath = await import('url').then(m => m.fileURLToPath);
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const universitiesJsonPath = path.join(__dirname, '../scraped-data/universities.json');
    const universitiesJson = JSON.parse(fs.readFileSync(universitiesJsonPath, 'utf8'));

    const dbUniByName = {};
    dbUnis.forEach(u => {
      dbUniByName[u.name.toLowerCase().trim()] = u;
    });

    const targetUnis = [];
    for (const uniJson of universitiesJson) {
      const dbUni = dbUniByName[uniJson.name.toLowerCase().trim()];
      if (dbUni) {
        targetUnis.push({
          id: dbUni.id,
          name: dbUni.name,
          slug: uniJson.slug
        });
      } else {
        console.warn(`Warning: University "${uniJson.name}" in JSON not found in database.`);
      }
    }

    if (isTest) {
      // Test only on Cyberjaya University
      const cyberjayaUni = targetUnis.find(u => u.slug === 'cyberjaya-university');
      if (!cyberjayaUni) {
        console.error('Cyberjaya University not found in target list!');
        return;
      }
      console.log(`\n=== TESTING ON ${cyberjayaUni.name} ===`);
      const accoms = await scrapeUniversityAccommodations(cyberjayaUni.slug);
      console.log(`Scraped ${accoms.length} accommodations.`);
      console.log(JSON.stringify(accoms, null, 2));
    } else {
      // Full Mode: Scrape all universities
      console.log('\nClearing all old accommodations from database...');
      await client.query('DELETE FROM public.accommodations');
      console.log('Old accommodations cleared.');

      const limit = pLimit(5); // Concurrency limit of 5
      let totalInserted = 0;

      const tasks = targetUnis.map(uni => {
        return limit(async () => {
          try {
            const accoms = await scrapeUniversityAccommodations(uni.slug);
            if (accoms.length > 0) {
              console.log(`Scraped ${accoms.length} accommodations for ${uni.name}. Inserting...`);
              
              for (const a of accoms) {
                await client.query(
                  `INSERT INTO public.accommodations (
                    name, city, type, price_per_month, amenities, near_university_ids,
                    image_url, image_urls, tag, unit_types, travel_distance_time, 
                    available_room_types, room_rents
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                  [
                    a.name,
                    a.city,
                    a.type,
                    a.price_per_month,
                    JSON.stringify(a.amenities),
                    JSON.stringify([uni.id]), // Link to this university
                    a.image_url,
                    JSON.stringify(a.image_urls),
                    a.tag,
                    JSON.stringify(a.unit_types),
                    JSON.stringify(a.travel_distance_time),
                    JSON.stringify(a.available_room_types),
                    JSON.stringify(a.room_rents)
                  ]
                );
              }
              totalInserted += accoms.length;
            } else {
              console.log(`No accommodations found for ${uni.name}.`);
            }
          } catch (err) {
            console.error(`Failed to process accommodations for ${uni.name}:`, err.message);
          }
        });
      });

      await Promise.all(tasks);
      console.log(`\n🎉 Accommodation scraping completed! Inserted ${totalInserted} accommodations in total.`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
