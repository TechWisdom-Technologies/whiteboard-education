import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";

// Inverted mapping to get slug from DB uni name
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
        
        if (data.length < limit) break; // Reached the end
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

async function scrapeCoursePage(course) {
    const url = `https://en.your-uni.com/university/${course.uniSlug}/${generateSlug(course.title)}/`;
    try {
        const response = await fetch(url, { timeout: 15000 });
        if (!response.ok) return null; // Course page might not exist or slug is wrong
        const html = await response.text();
        const $ = cheerio.load(html);

        let entryRequirementsText = "";
        $('h1, h2, h3, h4, h5, span, div').each((i, el) => {
            if ($(el).text().toLowerCase().includes('entry requirements')) {
                const nextText = $(el).parent().next().text().trim();
                if (nextText.length > 20) entryRequirementsText = nextText;
            }
        });

        let offerLetter = "Fees Applies";
        if (html.toLowerCase().includes('free offer letter')) offerLetter = "Free";

        const yearlyFees = [];
        $('table').each((i, table) => {
            const text = $(table).text().toLowerCase();
            if (text.includes('1st year') || (text.includes('year') && text.includes('myr'))) {
                if (yearlyFees.length === 0) { // take first matching table
                    $(table).find('tr').each((j, tr) => {
                        const tds = $(tr).find('td');
                        if (tds.length >= 2) {
                            const year = $(tds[0]).text().trim();
                            const fee = $(tds[1]).text().trim();
                            if (year.toLowerCase().includes('year')) yearlyFees.push({ year, fee });
                        }
                    });
                }
            }
        });

        const otherFees = [];
        $('table').each((i, table) => {
            const text = $(table).text().toLowerCase();
            if (text.includes('visa') || text.includes('processing')) {
                $(table).find('tr').each((j, tr) => {
                    const tds = $(tr).find('td');
                    if (tds.length >= 2) {
                        const desc = $(tds[0]).text().trim();
                        const fee = $(tds[1]).text().trim();
                        if (desc && fee && !desc.toLowerCase().includes('description')) {
                            otherFees.push({ description: desc, fee });
                        }
                    }
                });
            }
        });

        const curriculum = [];
        $('.elementor-accordion-item').each((i, el) => {
            const title = $(el).find('.elementor-accordion-title').text().trim();
            if (title) {
                const modules = [];
                $(el).find('li, td').each((j, li) => {
                    const mod = $(li).text().trim();
                    if (mod && mod.length > 2 && !mod.toLowerCase().includes('credit hours') && !mod.toLowerCase().includes('subject')) {
                        modules.push(mod);
                    }
                });
                if (modules.length > 0) {
                    curriculum.push({ year: title, modules: [...new Set(modules)] });
                }
            }
        });

        // Only return if we found useful data
        if (yearlyFees.length || otherFees.length || curriculum.length || entryRequirementsText) {
            return {
                id: course.id,
                title: course.title,
                url: url,
                entryRequirementsText,
                offerLetter,
                yearlyFees: yearlyFees.length > 0 ? yearlyFees : null,
                otherFees: otherFees.length > 0 ? otherFees : null,
                curriculum: curriculum.length > 0 ? curriculum : null
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function main() {
    console.log("Fetching universities from DB...");
    const unis = await supabaseSelect("universities", "id, name");
    const uniIdMap = {};
    for (const u of unis) uniIdMap[u.id] = uniSlugMap[u.name];

    console.log("Fetching courses from DB...");
    const dbCourses = await supabaseSelect("courses", "id, title, university_id");
    
    const coursesToScrape = [];
    for (const c of dbCourses) {
        const uniSlug = uniIdMap[c.university_id];
        if (uniSlug) {
            coursesToScrape.push({ id: c.id, title: c.title, uniSlug });
        }
    }

    console.log(`Prepared ${coursesToScrape.length} courses to scrape.`);

    const limit = pLimit(10);
    let completed = 0;

    const scrapePromises = coursesToScrape.map(course => limit(async () => {
        const data = await scrapeCoursePage(course);
        completed++;
        if (completed % 50 === 0) {
            console.log(`Progress: ${completed} / ${coursesToScrape.length} scraped...`);
        }
        return data;
    }));

    console.log("Starting scraper... This will take a while.");
    const results = await Promise.all(scrapePromises);
    const validResults = results.filter(r => r !== null);

    console.log(`Successfully extracted detailed data for ${validResults.length} courses.`);

    const allSql = [];
    allSql.push("-- ================================================================");
    allSql.push("-- Whiteboard Education: Deep Course Details UPDATE");
    allSql.push("-- ================================================================\n");

    // Chunking updates so the SQL file doesn't crash the Supabase SQL editor
    for (const data of validResults) {
        let updates = [];
        if (data.offerLetter) updates.push(`offer_letter = '${sqlEsc(data.offerLetter)}'`);
        if (data.entryRequirementsText) updates.push(`entry_requirements_text = '${sqlEsc(data.entryRequirementsText)}'`);
        if (data.yearlyFees) updates.push(`yearly_fees = '${sqlEsc(JSON.stringify(data.yearlyFees))}'::jsonb`);
        if (data.otherFees) updates.push(`other_fees = '${sqlEsc(JSON.stringify(data.otherFees))}'::jsonb`);
        if (data.curriculum) updates.push(`curriculum = '${sqlEsc(JSON.stringify(data.curriculum))}'::jsonb`);

        if (updates.length > 0) {
            allSql.push(`UPDATE public.courses SET ${updates.join(', ')} WHERE id = '${data.id}';`);
        }
    }

    const outputPath = join(__dirname, "update-course-details.sql");
    writeFileSync(outputPath, allSql.join("\n"), "utf8");
    console.log(`\nDONE! SQL written to ${outputPath}`);
    console.log("To apply: paste the generated SQL file in your Supabase SQL Editor and run it.");
}

main().catch(console.error);
