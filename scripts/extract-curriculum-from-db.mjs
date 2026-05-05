import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";

async function supabaseSelectAll(table, select = "*") {
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

function sqlEsc(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

async function main() {
    console.log("Fetching courses from Supabase...");
    const courses = await supabaseSelectAll("courses", "id, title, entry_requirements_text, curriculum");

    console.log(`Analyzing ${courses.length} courses...`);
    
    let fixedCount = 0;
    const allSql = [];
    
    allSql.push("-- ================================================================");
    allSql.push("-- Whiteboard Education: Curriculum Fixer Update");
    allSql.push("-- ================================================================\n");

    for (const course of courses) {
        let text = course.entry_requirements_text;
        if (!text) continue;

        // If it accidentally grabbed the curriculum
        if (text.includes('YEAR 1') || text.includes('Curriculum') || text.includes('Year 1')) {
            let splitText = text.split(/Curriculum/i);
            
            // The actual entry requirement is usually before "Curriculum"
            let realEntryReq = splitText[0].trim();
            
            // The curriculum data is after "Curriculum" or just mixed in
            let rawCurriculum = splitText.length > 1 ? splitText[1] : text;

            // Parse rawCurriculum into JSON structure
            const lines = rawCurriculum.split('\n').map(l => l.trim()).filter(l => l.length > 2);
            
            let curriculumJson = [];
            let currentYear = null;

            for (const line of lines) {
                if (/^(YEAR|Year)\s*\d+$/i.test(line) || /^(Trimester|Semester)\s*\d+$/i.test(line)) {
                    currentYear = { year: line, modules: [] };
                    curriculumJson.push(currentYear);
                } else {
                    if (!currentYear) {
                        currentYear = { year: "Core Subjects", modules: [] };
                        curriculumJson.push(currentYear);
                    }
                    if (!line.toLowerCase().includes('credit') && !line.toLowerCase().includes('subject')) {
                        currentYear.modules.push(line);
                    }
                }
            }

            // Remove empty years
            curriculumJson = curriculumJson.filter(y => y.modules.length > 0);

            if (curriculumJson.length > 0) {
                // If the course already has a curriculum from the previous scraper (accordion ones), don't overwrite
                // But wait, the user said "supabase data is blank", so it's probably null or empty
                if (!course.curriculum || (Array.isArray(course.curriculum) && course.curriculum.length === 0) || course.curriculum === 'null') {
                    
                    let updates = [];
                    updates.push(`curriculum = '${sqlEsc(JSON.stringify(curriculumJson))}'::jsonb`);
                    
                    // Also clean up the entry requirements to remove the bleeding curriculum
                    if (realEntryReq) {
                         updates.push(`entry_requirements_text = '${sqlEsc(realEntryReq)}'`);
                    } else {
                         updates.push(`entry_requirements_text = NULL`);
                    }

                    allSql.push(`UPDATE public.courses SET ${updates.join(', ')} WHERE id = '${course.id}';`);
                    fixedCount++;
                }
            }
        }
    }

    if (fixedCount > 0) {
        const outputPath = join(__dirname, "fix-curriculum.sql");
        writeFileSync(outputPath, allSql.join("\n"), "utf8");
        console.log(`\nSuccessfully rescued curriculum data for ${fixedCount} courses!`);
        console.log(`SQL written to ${outputPath}`);
    } else {
        console.log("No missing curriculums found that could be rescued from entry_requirements_text.");
    }
}

main().catch(console.error);
