import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";

const BASE_URL = "https://en.your-uni.com";

async function supabaseSelectAll(table, select = "*") {
    let allData = [];
    let offset = 0;
    const limit = 1000;
    while (true) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=${limit}&offset=${offset}`, {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        });
        if (!res.ok) throw new Error(`Supabase error: ${await res.text()}`);
        const data = await res.json();
        allData = allData.concat(data);
        if (data.length < limit) break;
        offset += limit;
    }
    return allData;
}

function sqlEsc(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

function generateSlug(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function scrapeRealUrl(url) {
    try {
        const response = await fetch(url, { timeout: 15000 });
        if (!response.ok) return null;
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let curriculum = [];

        // STRATEGY 1: Elementor Accordion
        $('.elementor-accordion-item').each((i, el) => {
            const title = $(el).find('.elementor-accordion-title').text().trim();
            if (title) {
                const modules = [];
                $(el).find('li, td').each((j, li) => {
                    const mod = $(li).text().trim();
                    if (mod && mod.length > 2 && !mod.toLowerCase().includes('credit hours')) {
                        modules.push(mod);
                    }
                });
                if (modules.length > 0) curriculum.push({ year: title, modules: [...new Set(modules)] });
            }
        });

        // STRATEGY 2: Plain text under "Curriculum" heading
        if (curriculum.length === 0) {
            let foundCurriculumHeader = false;
            let currentYear = null;
            let plainCurriculum = [];

            $('h1, h2, h3, h4, h5, h6, span, div, p').each((i, el) => {
                const text = $(el).text().trim();
                
                if (text.toLowerCase() === 'curriculum' || text.toLowerCase() === 'programme structure') {
                    foundCurriculumHeader = true;
                    return;
                }
                
                if (foundCurriculumHeader) {
                    // If we hit another major section, stop parsing curriculum
                    if (text.toLowerCase() === 'entry requirements' || text.toLowerCase() === 'career opportunities' || text.toLowerCase() === 'fees' || text.toLowerCase() === 'apply now') {
                        foundCurriculumHeader = false;
                        return;
                    }

                    if (/^(YEAR|Year|Semester|Trimester)\s*\d+/i.test(text)) {
                        currentYear = { year: text, modules: [] };
                        plainCurriculum.push(currentYear);
                    } else if (currentYear && text.length > 2 && text.length < 150) {
                        // avoid pushing massive blocks of text
                        if (!text.toLowerCase().includes('credit') && !text.toLowerCase().includes('subject')) {
                            currentYear.modules.push(text);
                        }
                    } else if (!currentYear && text.length > 2 && text.length < 100) {
                        // Sometimes they don't list years, just a flat list of subjects
                        currentYear = { year: "Core Subjects", modules: [] };
                        plainCurriculum.push(currentYear);
                        currentYear.modules.push(text);
                    }
                }
            });

            // Filter out empty years
            plainCurriculum = plainCurriculum.filter(y => y.modules.length > 0);
            if (plainCurriculum.length > 0) {
                curriculum = plainCurriculum;
            }
        }
        
        return curriculum.length > 0 ? curriculum : null;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log("Fetching all missing courses from Supabase...");
    const allCourses = await supabaseSelectAll("courses", "id, title, university_id, curriculum");
    const universities = await supabaseSelectAll("universities", "id, name");

    const uniMap = {};
    universities.forEach(u => uniMap[u.id] = u.name);

    // Find courses that literally have NO curriculum, or empty array
    const missingCourses = allCourses.filter(c => !c.curriculum || (Array.isArray(c.curriculum) && c.curriculum.length === 0) || c.curriculum === 'null' || c.curriculum === '[]');
    
    console.log(`Found ${missingCourses.length} courses with blank curriculums. Searching live website...`);

    let fixedCount = 0;
    const allSql = [];
    allSql.push("-- Missing Curriculum Fill\n");

    // We will process in batches of 20 to be fast
    const BATCH_SIZE = 20;
    for (let i = 0; i < missingCourses.length; i += BATCH_SIZE) {
        const batch = missingCourses.slice(i, i + BATCH_SIZE);
        
        const promises = batch.map(async (course) => {
            const uniName = uniMap[course.university_id];
            if (!uniName) return;

            const uniSlug = generateSlug(uniName);
            const courseSlug = generateSlug(course.title);
            
            // Try standard url
            let url = `${BASE_URL}/university/${uniSlug}/${courseSlug}/`;
            let curriculum = await scrapeRealUrl(url);

            // Try alternative URL (sometimes they omit the university from the URL, or add -2)
            if (!curriculum) {
                url = `${BASE_URL}/university/${uniSlug}/${courseSlug}-2/`;
                curriculum = await scrapeRealUrl(url);
            }

            if (curriculum) {
                allSql.push(`UPDATE public.courses SET curriculum = '${sqlEsc(JSON.stringify(curriculum))}'::jsonb WHERE id = '${course.id}';`);
                fixedCount++;
                console.log(`[OK] Rescued curriculum for: ${course.title}`);
            } else {
                console.log(`[FAILED] Could not find curriculum on page for: ${course.title}`);
            }
        });

        await Promise.all(promises);
    }

    if (fixedCount > 0) {
        const path = join(__dirname, "fill-missing-curriculums.sql");
        writeFileSync(path, allSql.join("\n"), "utf8");
        console.log(`\nDONE! Rescued an additional ${fixedCount} curriculums! SQL written to ${path}`);
    } else {
        console.log("\nNo more curriculums could be found. They are likely not published on the website.");
    }
}

main().catch(console.error);
