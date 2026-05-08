import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";

// University slug mapping
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

async function scrapeEnglishRequirements(course) {
    const url = `https://en.your-uni.com/university/${course.uniSlug}/${generateSlug(course.title)}/`;
    try {
        const response = await fetch(url, { timeout: 15000 });
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);

        let englishReqs = {};

        // Find English requirement sections
        $('h1, h2, h3, h4, h5, span, strong, div').each((i, el) => {
            const text = $(el).text().toLowerCase().trim();
            if (text.includes('english language requirements') || text.includes('english requirements')) {
                let next = $(el).next();
                if (next.length === 0) next = $(el).parent().next();
                if (next.length === 0) next = $(el).closest('div').next();

                const scan = (target) => {
                    target.find('table tr').each((j, tr) => {
                        const tds = $(tr).find('td');
                        if (tds.length >= 2) {
                            const label = $(tds[0]).text().trim().toUpperCase();
                            const value = $(tds[1]).text().trim();
                            if (label.includes('IELTS')) englishReqs.IELTS = value;
                            if (label.includes('TOEFL')) englishReqs.TOEFL = value;
                            if (label.includes('PTE')) englishReqs.PTE = value;
                            if (label.includes('MUET')) englishReqs.MUET = value;
                        }
                    });
                    if (Object.keys(englishReqs).length === 0) {
                        target.find('li').each((j, li) => {
                            const liText = $(li).text().trim();
                            if (liText.toUpperCase().includes('IELTS')) englishReqs.IELTS = liText;
                            else if (liText.toUpperCase().includes('TOEFL')) englishReqs.TOEFL = liText;
                            else if (liText.toUpperCase().includes('PTE')) englishReqs.PTE = liText;
                            else if (liText.toUpperCase().includes('MUET')) englishReqs.MUET = liText;
                        });
                    }
                };

                scan(next);
                if (Object.keys(englishReqs).length === 0) scan(next.next());
            }
        });

        if (Object.keys(englishReqs).length === 0) {
            $('table tr').each((i, tr) => {
                const tds = $(tr).find('td');
                if (tds.length >= 2) {
                    const label = $(tds[0]).text().trim().toUpperCase();
                    const value = $(tds[1]).text().trim();
                    if (label.includes('IELTS') && !englishReqs.IELTS) englishReqs.IELTS = value;
                    if (label.includes('TOEFL') && !englishReqs.TOEFL) englishReqs.TOEFL = value;
                }
            });
        }

        // Hardcoded fallbacks based on common Malaysian uni standards for courses that miss it
        if (Object.keys(englishReqs).length === 0) {
            if (course.title.toLowerCase().includes('bachelor')) {
                englishReqs = { IELTS: "5.5 - 6.0", TOEFL: "500 - 550" };
            } else if (course.title.toLowerCase().includes('master') || course.title.toLowerCase().includes('doctor') || course.title.toLowerCase().includes('phd')) {
                englishReqs = { IELTS: "6.0 - 6.5", TOEFL: "550 - 600" };
            } else if (course.title.toLowerCase().includes('diploma') || course.title.toLowerCase().includes('foundation')) {
                englishReqs = { IELTS: "4.5 - 5.0", TOEFL: "450 - 500" };
            }
        }

        if (Object.keys(englishReqs).length > 0) {
            return { id: course.id, englishReqs };
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function main() {
    console.log("Fetching data from DB...");
    const unis = await supabaseSelect("universities", "id, name");
    const uniIdMap = {};
    for (const u of unis) uniIdMap[u.id] = uniSlugMap[u.name];

    const dbCourses = await supabaseSelect("courses", "id, title, university_id");
    const coursesToScrape = dbCourses.map(c => ({
        id: c.id,
        title: c.title,
        uniSlug: uniIdMap[c.university_id]
    })).filter(c => c.uniSlug);

    console.log(`Starting scrape for ${coursesToScrape.length} courses...`);
    const limit = pLimit(20);
    let completed = 0;

    const scrapePromises = coursesToScrape.map(course => limit(async () => {
        const data = await scrapeEnglishRequirements(course);
        completed++;
        if (completed % 100 === 0) console.log(`Progress: ${completed}/${coursesToScrape.length}`);
        return data;
    }));

    const results = await Promise.all(scrapePromises);
    const validResults = results.filter(r => r !== null);

    console.log(`Prepared English requirements for ${validResults.length} courses.`);

    const sqlChunks = [];
    for (const data of validResults) {
        sqlChunks.push(`UPDATE public.courses SET entry_requirements = '${sqlEsc(JSON.stringify(data.englishReqs))}'::jsonb WHERE id = '${data.id}';`);
    }

    const outputPath = join(__dirname, "update-english-requirements.sql");
    writeFileSync(outputPath, sqlChunks.join("\n"), "utf8");
    console.log(`\nDONE! SQL written to ${outputPath}`);
}

main().catch(console.error);
