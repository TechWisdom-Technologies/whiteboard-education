/**
 * Parse all saved university markdown files and generate SQL INSERT statements
 * 
 * Usage: node scripts/parse-markdown-to-sql.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STEPS_DIR = "C:\\Users\\FIDBI\\.gemini\\antigravity\\brain\\ab8e3ecf-0c3b-459d-afcf-03477f1bc649\\.system_generated\\steps";

// Map step numbers to university names (from the read_url_content calls)
const STEP_MAP = [
  { step: 751, name: "Multimedia University Malaysia (MMU)" },
  { step: 736, name: "UCSI University Malaysia" },
  { step: 754, name: "Taylor's University Malaysia" },
  { step: 755, name: "APU University Malaysia" },
  { step: 756, name: "UNITEN University Malaysia" },
  { step: 757, name: "City University Malaysia" },
  { step: 758, name: "Cyberjaya University Malaysia (UoC)" },
  { step: 759, name: "MAHSA University Malaysia" },
  { step: 760, name: "UTP University Malaysia" },
  { step: 761, name: "SEGi University Malaysia" },
  { step: 764, name: "Limkokwing University Malaysia" },
  { step: 765, name: "Infrastructure University Kuala Lumpur (IUKL)" },
  { step: 766, name: "INTI International University Malaysia" },
  { step: 767, name: "UniKL University Malaysia" },
  { step: 768, name: "HELP University Malaysia" },
  { step: 769, name: "Tunku Abdul Rahman University (UTAR)" },
  { step: 770, name: "Nottingham University Malaysia" },
  { step: 771, name: "MONASH University Malaysia" },
  { step: 774, name: "International University of Malaya-Wales (IUMW)" },
  { step: 775, name: "UTM University Malaysia" },
  { step: 776, name: "UTeM University Malaysia" },
  { step: 777, name: "Lincoln University College" },
  { step: 778, name: "University Malaysia of Computer Science & Engineering (UNIMY)" },
  { step: 779, name: "Sunway University" },
  { step: 780, name: "Management and Science University (MSU)" },
  { step: 781, name: "Swinburne University of Technology Sarawak" },
  { step: 785, name: "UTM SPACE University Malaysia" },
  { step: 786, name: "Heriot-Watt University Malaysia Campus" },
  { step: 787, name: "University of Southampton Malaysia" },
  { step: 788, name: "Curtin University Malaysia" },
  { step: 789, name: "Swinburne University of Technology Sarawak Campus" },
  { step: 790, name: "Xiamen University Malaysia Campus" },
  { step: 791, name: "International Medical University (IMU)" },
  { step: 792, name: "Universiti Geomatika Malaysia" },
  { step: 797, name: "NILAI University" },
  { step: 798, name: "University of Wollongong (UOW) Malaysia" },
  { step: 799, name: "Newcastle University Medicine Malaysia (NUMed)" },
  { step: 800, name: "Universiti Malaya (UM)" },
  { step: 801, name: "Kings University College Malaysia" },
  { step: 802, name: "Binary University" },
  { step: 803, name: "Tunku Abdul Rahman University of Management and Technology (TAR UMT)" },
  { step: 804, name: "Universiti Putra Malaysia (UPM)" },
];

// Parse courses from markdown text
function parseCoursesFromMarkdown(text) {
  const courses = [];
  const seen = new Set();
  
  // Pattern: [Course...MYR xxx/Year • ... • x.xx Years • Months Intake](url)
  const regex = /\[([^\]]*?MYR\s+[\d,]+\/Year\s*•[^\]]*?Intake)\]\([^)]+\)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const inner = match[1].trim();
    
    const cm = inner.match(/^(.+?)MYR\s+([\d,]+)\/Year\s*•\s*(?:Free Offer Letter|Offer Letter Fees Applies)\s*•\s*([\d.]+)\s*Years?\s*•\s*(.+?)\s*Intake\s*$/);
    if (!cm) continue;
    
    let rawTitle = cm[1].trim();
    const feeMyr = parseInt(cm[2].replace(/,/g, ""));
    const duration = parseFloat(cm[3]);
    const intakeStr = cm[4].trim();
    
    // Remove university name and campus from title
    rawTitle = rawTitle
      // Remove all known university name patterns
      .replace(/(?:UCSI|MMU|Taylor'?s?|APU|UNITEN|City|Cyberjaya|MAHSA|UTP|SEGi|Limkokwing|Infrastructure|INTI|UniKL|Help|UTAR|Nottingham|MONASH|IUMW|UTM|UTeM|Lincoln|UNIMY|Sunway|MSU|Heriot-Watt|Southampton|Curtin|Swinburne|Xiamen|IMU|Geomatika|NILAI|Wollongong|Newcastle|NUMed|Kings|Binary|UPM|UOW|TAR\s*UMT|IUKL)\s*University[^(]*/gi, "")
      .replace(/Universiti\s+(?:Putra|Malaya|Geomatika|Teknologi|Teknikal)\s*(?:Malaysia)?\s*(?:Melaka)?\s*/gi, "")
      .replace(/University\s+(?:Malaysia|of\s+\w+)[^(]*/gi, "")
      .replace(/University\s+College[^(]*/gi, "")
      .replace(/Tunku\s+Abdul\s+Rahman[^(]*/gi, "")
      .replace(/Management\s+and\s+Science[^(]*/gi, "")
      .replace(/International\s+Medical[^(]*/gi, "")
      .replace(/Multimedia[^(]*/gi, "")
      .replace(/Asia\s+Pacific[^(]*/gi, "")
      .replace(/\s*\([A-Za-z\s,]+\)\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    if (!rawTitle || rawTitle.length < 3) continue;
    
    // Skip if we've seen this exact title
    const key = rawTitle.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    
    // Classify degree level
    let degreeLevel = "Bachelor";
    const tl = rawTitle.toLowerCase();
    if (tl.includes("foundation")) degreeLevel = "Foundation";
    else if (tl.includes("diploma") || tl.includes("certificate")) degreeLevel = "Foundation";
    else if (tl.includes("doctor") || tl.includes("phd") || tl.startsWith("industrial phd")) degreeLevel = "PhD";
    else if (tl.includes("master") || tl.includes("postgraduate") || tl.includes("m.phil") || tl.includes("mba")) degreeLevel = "Master";
    
    // Parse intake months
    const intakeMonths = intakeStr
      .replace(/\s*&\s*/g, ",")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    
    const tuitionUsd = Math.round(feeMyr * 0.22);
    
    courses.push({
      title: rawTitle,
      degree_level: degreeLevel,
      tuition_fee: tuitionUsd,
      tuition_myr: feeMyr,
      duration: duration === 1 ? "1 year" : `${duration} years`,
      intake_months: intakeMonths,
    });
  }
  
  return courses;
}

// Escape for SQL
function sqlEsc(str) {
  return str.replace(/'/g, "''");
}

// ── MAIN ─────────────────────────────────────────────────────
function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Parse Markdown → SQL Course Import             ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  
  let allSql = [];
  let totalCourses = 0;
  let uniStats = [];
  
  allSql.push("-- ================================================================");
  allSql.push("-- Whiteboard Education: Course Data Import");
  allSql.push("-- Generated: " + new Date().toISOString());
  allSql.push("-- Run this AFTER import-universities.sql in Supabase SQL Editor");
  allSql.push("-- ================================================================\n");
  allSql.push("-- Delete existing courses first");
  allSql.push("DELETE FROM public.courses;\n");
  
  for (const { step, name } of STEP_MAP) {
    const filePath = join(STEPS_DIR, String(step), "content.md");
    
    if (!existsSync(filePath)) {
      console.log(`  ✗ [${step}] ${name} — file not found`);
      uniStats.push({ name, count: 0 });
      continue;
    }
    
    const text = readFileSync(filePath, "utf8");
    const courses = parseCoursesFromMarkdown(text);
    
    if (courses.length > 0) {
      allSql.push(`\n-- ${name} (${courses.length} courses)`);
      
      // Split into batches of 50 to avoid SQL statement size limits
      for (let batch = 0; batch < courses.length; batch += 50) {
        const batchCourses = courses.slice(batch, batch + 50);
        allSql.push(`INSERT INTO public.courses (title, university_id, degree_level, tuition_fee, duration, intake_months, overview) VALUES`);
        
        const valueLines = batchCourses.map(c => {
          const intakeJson = JSON.stringify(c.intake_months);
          const overview = `${c.title}. Annual tuition: MYR ${c.tuition_myr.toLocaleString()} (approx. USD ${c.tuition_fee.toLocaleString()}).`;
          return `  ('${sqlEsc(c.title)}', (SELECT id FROM public.universities WHERE name = '${sqlEsc(name)}' LIMIT 1), '${c.degree_level}', ${c.tuition_fee}, '${c.duration}', '${intakeJson}'::jsonb, '${sqlEsc(overview)}')`;
        });
        
        allSql.push(valueLines.join(",\n") + ";");
      }
      
      totalCourses += courses.length;
    }
    
    console.log(`  [${step}] ${name.substring(0, 50).padEnd(50)} ${courses.length} courses`);
    uniStats.push({ name, count: courses.length });
  }
  
  // Verification query
  allSql.push("\n-- Verification");
  allSql.push("SELECT u.name, COUNT(c.id) as course_count");
  allSql.push("FROM universities u");
  allSql.push("LEFT JOIN courses c ON c.university_id = u.id");
  allSql.push("GROUP BY u.name");
  allSql.push("ORDER BY course_count DESC;");
  
  // Write output
  const outputPath = join(__dirname, "import-courses.sql");
  writeFileSync(outputPath, allSql.join("\n"), "utf8");
  
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Total courses: ${totalCourses}`);
  console.log(`  Universities with courses: ${uniStats.filter(s => s.count > 0).length}/${STEP_MAP.length}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  File size: ${(readFileSync(outputPath).length / 1024).toFixed(0)} KB`);
  console.log(`═══════════════════════════════════════════════════`);
}

main();
