/**
 * Scrape course overview text from en.your-uni.com using Puppeteer.
 * The overview content is loaded dynamically via JavaScript, so we need
 * a headless browser to click the "Course Overview" tab and extract the text.
 *
 * Usage:  node scripts/scrape-course-overview.mjs
 *
 * Output: scripts/update-course-overview.sql
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";

// University slug mapping (same as other scrapers)
const uniSlugMap = {
    "Multimedia University Malaysia (MMU)": "mmu-university",
    "UCSI University Malaysia": "ucsi-university",
    "Taylor's University Malaysia": "taylor-university-malaysia",
    "APU University Malaysia": "apu-university",
    "UNITEN University Malaysia": "uniten-university",
    "City University Malaysia": "city-university",
    "Cyberjaya University Malaysia (UoC)": "cyberjaya-university",
    "MAHSA University Malaysia": "mahsa-university",
    "UTP University Malaysia": "utp-university",
    "SEGi University Malaysia": "segi-university",
    "Limkokwing University Malaysia": "limkokwing-university",
    "Infrastructure University Kuala Lumpur (IUKL)": "iukl-university",
    "INTI International University Malaysia": "inti-university",
    "UniKL University Malaysia": "unikl-university",
    "HELP University Malaysia": "help-university",
    "Tunku Abdul Rahman University (UTAR)": "utar-university",
    "Nottingham University Malaysia": "nottingham-university",
    "MONASH University Malaysia": "monash-university",
    "International University of Malaya-Wales (IUMW)": "iumw-university",
    "UTM University Malaysia": "utm-university",
    "UTeM University Malaysia": "utem-university",
    "Lincoln University College": "lincoln-university-college",
    "University Malaysia of Computer Science & Engineering (UNIMY)": "unimy-university",
    "Sunway University": "sunway-university",
    "Management and Science University (MSU)": "msu-university",
    "Swinburne University of Technology Sarawak Campus": "swinburne-university-of-technology-sarawak-campus",
    "Swinburne University of Technology Sarawak": "swinburne-university-of-technology-sarawak-campus",
    "UTM SPACE University Malaysia": "utm-space-university-malaysia",
    "Heriot-Watt University Malaysia Campus": "heriot-watt-university-malaysia-campus",
    "University of Southampton Malaysia": "university-of-southampton",
    "Curtin University Malaysia": "curtin-university-malaysia",
    "Xiamen University Malaysia Campus": "xiamen-university-malaysia-campus",
    "International Medical University (IMU)": "international-medical-university",
    "Universiti Geomatika Malaysia": "universiti-geomatika-malaysia",
    "NILAI University": "nilai-university",
    "University of Wollongong (UOW) Malaysia": "university-of-wollongong-uow",
    "Newcastle University Medicine Malaysia (NUMed)": "newcastle-university-medicine-malaysia",
    "Universiti Malaya (UM)": "universiti-malaya-um",
    "Kings University College Malaysia": "kings-university-college",
    "Binary University": "binary-university",
    "Tunku Abdul Rahman University of Management and Technology (TAR UMT)": "tunku-abdul-rahman-university-of-management-and-technology-tar-umt",
    "Universiti Putra Malaysia (UPM)": "upm-university"
};

async function supabaseSelect(table, select = "*") {
    let allData = [];
    let offset = 0;
    const limit = 1000;
    while (true) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=${limit}&offset=${offset}`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        if (!res.ok) throw new Error(`Supabase select failed: ${await res.text()}`);
        const data = await res.json();
        allData = allData.concat(data);
        if (data.length < limit) break;
        offset += limit;
    }
    return allData;
}

function generateSlug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sqlEsc(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

/**
 * Scrape the course overview from a single course page using Puppeteer.
 * Opens the page, clicks the "Course Overview" tab, and extracts the text.
 */
async function scrapeOverview(page, course) {
    const url = `https://en.your-uni.com/university/${course.uniSlug}/${generateSlug(course.title)}/`;
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
        
        // Wait for the page to render
        await new Promise(r => setTimeout(r, 2000));

        // Click the "Course Overview" tab to reveal the content
        try {
            await page.waitForSelector('#btn-course-overview', { timeout: 5000 });
            await page.click('#btn-course-overview');
            await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
            // Tab might not exist, continue anyway
        }

        // Extract the overview text from the page
        const overviewText = await page.evaluate(() => {
            let resultText = null;
            // Strategy 1: Find all collapses
            const items = document.querySelectorAll('.course-details-item-collapse');
            items.forEach(item => {
                const btn = item.querySelector('.course-details-item-collapse-btn');
                const btnText = btn ? btn.innerText.toLowerCase() : '';
                const body = item.querySelector('.course-details-item-collapse-body');
                if (btnText.includes('overview') || btnText.includes('description')) {
                    if (body) resultText = body.innerText.trim();
                }
            });
            
            // Strategy 2: If it's not in a collapse but just text inside #course-overview-section
            if (!resultText) {
                const ovSection = document.getElementById('course-overview-section');
                if (ovSection) {
                    // Ignore curriculum section inside it
                    const curriculum = ovSection.querySelector('#course-curriculum-section');
                    if (curriculum) curriculum.remove();
                    resultText = ovSection.innerText.trim();
                }
            }
            
            // Clean the overview text - remove "Course Overview" prefix if it exists
            if (resultText) {
                resultText = resultText.replace(/^Course Overview\s*/i, '').trim();
            }
            
            return resultText;
        });

        if (overviewText && overviewText.length > 30) {
            return { id: course.id, title: course.title, overview: overviewText };
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function main() {
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║  Course Overview Scraper (Puppeteer-based)      ║");
    console.log("╚══════════════════════════════════════════════════╝\n");

    // Step 1: Fetch courses from DB
    console.log("▸ Step 1: Fetching data from Supabase...");
    const unis = await supabaseSelect("universities", "id, name");
    const uniIdMap = {};
    for (const u of unis) uniIdMap[u.id] = uniSlugMap[u.name];

    const dbCourses = await supabaseSelect("courses", "id, title, university_id, overview");
    
    // Filter to courses that need overview text
    // Only scrape courses that have no overview or a very short placeholder overview
    const coursesToScrape = dbCourses
        .map(c => ({
            id: c.id,
            title: c.title,
            uniSlug: uniIdMap[c.university_id],
            currentOverview: c.overview || ''
        }))
        .filter(c => c.uniSlug)
        .filter(c => {
            // Scrape if overview is missing or is just the placeholder pattern
            const ov = c.currentOverview;
            if (!ov || ov.length < 100) return true;
            // If it matches the auto-generated pattern "Course at University. Tuition: MYR..."
            if (ov.match(/^.+ at .+\. Tuition: MYR/)) return true;
            return false;
        });

    console.log(`  Found ${dbCourses.length} total courses.`);
    console.log(`  ${coursesToScrape.length} courses need overview scraping.\n`);

    // Step 2: Launch Puppeteer and scrape
    console.log("▸ Step 2: Launching headless browser...");
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Use multiple pages for concurrent scraping (limited concurrency)
    const CONCURRENCY = 3;
    const pages = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        pages.push(page);
    }

    console.log(`  Launched ${CONCURRENCY} browser pages.\n`);
    console.log(`▸ Step 3: Scraping ${coursesToScrape.length} courses...`);

    const outputPath = join(__dirname, "update-course-overview.sql");
    // Clear the file first
    writeFileSync(outputPath, "-- ================================================================\n-- Whiteboard Education: Course Overview UPDATE\n-- ================================================================\n\n", "utf8");

    const validResults = [];
    let completed = 0;
    let failed = 0;

    // Process in batches of CONCURRENCY
    for (let i = 0; i < coursesToScrape.length; i += CONCURRENCY) {
        const batch = coursesToScrape.slice(i, i + CONCURRENCY);
        const promises = batch.map((course, idx) => 
            scrapeOverview(pages[idx], course).then(result => {
                completed++;
                if (result) {
                    validResults.push(result);
                    // Write to file immediately
                    const sql = `UPDATE public.courses SET overview = '${sqlEsc(result.overview)}' WHERE id = '${result.id}';\n`;
                    import('fs').then(fs => fs.appendFileSync(outputPath, sql));
                    
                    if (validResults.length % 10 === 0) {
                        console.log(`  ✓ ${validResults.length} overviews scraped so far...`);
                    }
                } else {
                    failed++;
                }
                if (completed % 50 === 0) {
                    console.log(`  Progress: ${completed}/${coursesToScrape.length} (${validResults.length} success, ${failed} failed)`);
                }
            })
        );
        await Promise.all(promises);
        
        // Small delay between batches to be polite
        await new Promise(r => setTimeout(r, 500));
    }

    await browser.close();

    console.log(`\n  Scraping complete!`);
    console.log(`  Total: ${completed}, Success: ${validResults.length}, Failed: ${failed}\n`);
    console.log(`\n  ✓ SQL written to ${outputPath}`);
    console.log("  To apply: paste the generated SQL file in your Supabase SQL Editor and run it.\n");

    // Also log a summary of what was found
    console.log("═══════════════════════════════════════════════════");
    console.log(`  DONE! ${validResults.length} course overviews ready to update.`);
    console.log("═══════════════════════════════════════════════════");
}

main().catch(console.error);
