/**
 * Generate SQL INSERT statements for courses from en.your-uni.com
 * 
 * This script:
 * 1. Reads university pages via read_url_content (already fetched as markdown)
 * 2. Parses course data from the markdown links
 * 3. Generates SQL INSERT statements
 * 4. Writes to SQL file for execution in Supabase SQL Editor
 *
 * Usage: node scripts/generate-courses-sql.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// All 42 universities with their slugs  
const UNIVERSITIES = [
  { name: "Multimedia University Malaysia (MMU)", slug: "mmu-university" },
  { name: "UCSI University Malaysia", slug: "ucsi-university" },
  { name: "Taylor's University Malaysia", slug: "taylor-university-malaysia" },
  { name: "APU University Malaysia", slug: "apu-university" },
  { name: "UNITEN University Malaysia", slug: "uniten-university" },
  { name: "City University Malaysia", slug: "city-university" },
  { name: "Cyberjaya University Malaysia (UoC)", slug: "cyberjaya-university" },
  { name: "MAHSA University Malaysia", slug: "mahsa-university" },
  { name: "UTP University Malaysia", slug: "utp-university" },
  { name: "SEGi University Malaysia", slug: "segi-university" },
  { name: "Limkokwing University Malaysia", slug: "limkokwing-university" },
  { name: "Infrastructure University Kuala Lumpur (IUKL)", slug: "iukl-university" },
  { name: "INTI International University Malaysia", slug: "inti-university" },
  { name: "UniKL University Malaysia", slug: "unikl-university" },
  { name: "HELP University Malaysia", slug: "help-university" },
  { name: "Tunku Abdul Rahman University (UTAR)", slug: "utar-university" },
  { name: "Nottingham University Malaysia", slug: "nottingham-university" },
  { name: "MONASH University Malaysia", slug: "monash-university" },
  { name: "International University of Malaya-Wales (IUMW)", slug: "iumw-university" },
  { name: "UTM University Malaysia", slug: "utm-university" },
  { name: "UTeM University Malaysia", slug: "utem-university" },
  { name: "Lincoln University College", slug: "lincoln-university-college" },
  { name: "University Malaysia of Computer Science & Engineering (UNIMY)", slug: "university-malaysia-of-computer-science-and-engineering-unimy" },
  { name: "Sunway University", slug: "sunway-university" },
  { name: "Management and Science University (MSU)", slug: "msu-university" },
  { name: "Swinburne University of Technology Sarawak", slug: "swinburne-university-of-technology-sarawak" },
  { name: "UTM SPACE University Malaysia", slug: "utm-space-university-malaysia" },
  { name: "Heriot-Watt University Malaysia Campus", slug: "heriot-watt-university-malaysia-campus" },
  { name: "University of Southampton Malaysia", slug: "university-of-southampton" },
  { name: "Curtin University Malaysia", slug: "curtin-university-malaysia" },
  { name: "Swinburne University of Technology Sarawak Campus", slug: "swinburne-university-of-technology-sarawak-campus" },
  { name: "Xiamen University Malaysia Campus", slug: "xiamen-university-malaysia-campus" },
  { name: "International Medical University (IMU)", slug: "international-medical-university" },
  { name: "Universiti Geomatika Malaysia", slug: "universiti-geomatika-malaysia" },
  { name: "NILAI University", slug: "nilai-university" },
  { name: "University of Wollongong (UOW) Malaysia", slug: "university-of-wollongong-uow" },
  { name: "Newcastle University Medicine Malaysia (NUMed)", slug: "-newcastle-university-medicine-malaysia" },
  { name: "Universiti Malaya (UM)", slug: "universiti-malaya-um" },
  { name: "Kings University College Malaysia", slug: "kings-university-college" },
  { name: "Binary University", slug: "binary-university" },
  { name: "Tunku Abdul Rahman University of Management and Technology (TAR UMT)", slug: "tunku-abdul-rahman-university-of-management-and-technology-tar-umt" },
  { name: "Universiti Putra Malaysia (UPM)", slug: "upm-university" },
];

const BASE = "https://en.your-uni.com";

// Fetch page content via HTTP
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  return res.text();
}

// Parse courses from markdown-formatted content
function parseCoursesFromMarkdown(text, uniName) {
  const courses = [];
  const seen = new Set();
  
  // Pattern: [TitleUniNameMYR xxx/Year • ... • x.xx Years • Months Intake](url)
  const regex = /\[([^\]]+?MYR\s+[\d,]+\/Year\s*•[^\]]+?Intake)\]\([^)]+\)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const inner = match[1].trim();
    
    // Extract: "Course Title UniversityName (Campus) MYR xxx/Year • Free/Paid • x.xx Years • Months Intake"
    const cm = inner.match(/^(.+?)MYR\s+([\d,]+)\/Year\s*•\s*(?:Free Offer Letter|Offer Letter Fees Applies)\s*•\s*([\d.]+)\s*Years?\s*•\s*(.+?)\s*Intake\s*$/);
    if (!cm) continue;
    
    let rawTitle = cm[1].trim();
    const feeMyr = parseInt(cm[2].replace(/,/g, ""));
    const duration = parseFloat(cm[3]);
    const intakeStr = cm[4].trim();
    
    // Remove university name and campus from title
    // Pattern: "Course Title UCSI University Malaysia(Kuala Lumpur)"
    rawTitle = rawTitle
      .replace(/(?:UCSI|MMU|Taylor'?s?|APU|UNITEN|City|Cyberjaya|MAHSA|UTP|SEGi|Limkokwing|Infrastructure|INTI|UniKL|Help|UTAR|Nottingham|MONASH|IUMW|UTM|UTeM|Lincoln|UNIMY|Sunway|MSU|Heriot-Watt|Southampton|Curtin|Swinburne|Xiamen|IMU|Geomatika|NILAI|Wollongong|Newcastle|NUMed|Kings|Binary|UPM|UOW|TAR\s*UMT)\s*University[^(]*/gi, "")
      .replace(/Universiti\s+(?:Putra|Malaya|Geomatika|Teknologi)\s*(?:Malaysia)?\s*/gi, "")
      .replace(/University\s+(?:Malaysia|of\s+\w+)[^(]*/gi, "")
      .replace(/University\s+College[^(]*/gi, "")
      .replace(/Tunku\s+Abdul\s+Rahman[^(]*/gi, "")
      .replace(/Management\s+and\s+Science[^(]*/gi, "")
      .replace(/International\s+Medical[^(]*/gi, "")
      .replace(/Multimedia[^(]*/gi, "")
      .replace(/Asia\s+Pacific[^(]*/gi, "")
      .replace(/\s*\([A-Za-z\s,]+\)\s*$/g, "")  // Remove trailing (Campus Name)
      .replace(/\s+/g, " ")
      .trim();
    
    if (!rawTitle || rawTitle.length < 3) continue;
    
    // Deduplicate
    const key = rawTitle.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    
    // Classify degree level
    let degreeLevel = "Bachelor";
    const tl = rawTitle.toLowerCase();
    if (tl.includes("foundation")) degreeLevel = "Foundation";
    else if (tl.includes("diploma") || tl.includes("certificate") || tl.includes("advanced diploma")) degreeLevel = "Foundation";
    else if (tl.includes("doctor") || tl.includes("phd") || tl.startsWith("industrial phd")) degreeLevel = "PhD";
    else if (tl.includes("master") || tl.includes("postgraduate") || tl.includes("m.phil") || tl.includes("mba")) degreeLevel = "Master";
    
    // Parse intake months
    const intakeMonths = intakeStr
      .replace(/\s*&\s*/g, ",")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
    
    // Convert MYR to approximate USD
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

// Escape single quotes for SQL
function sqlEscape(str) {
  return str.replace(/'/g, "''");
}

// ── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Generate Course SQL from en.your-uni.com       ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  
  let allSql = [];
  let totalCourses = 0;
  
  // SQL header
  allSql.push("-- ================================================================");
  allSql.push("-- Whiteboard Education: Course Data Import");
  allSql.push("-- Generated: " + new Date().toISOString());
  allSql.push("-- Run this AFTER import-universities.sql in Supabase SQL Editor");
  allSql.push("-- ================================================================\n");
  allSql.push("-- Delete existing courses first");
  allSql.push("DELETE FROM public.courses;\n");
  
  for (let i = 0; i < UNIVERSITIES.length; i++) {
    const uni = UNIVERSITIES[i];
    process.stdout.write(`[${i + 1}/${UNIVERSITIES.length}] ${uni.name.substring(0, 45).padEnd(45)}...`);
    
    try {
      const url = `${BASE}/university/${uni.slug}`;
      const html = await fetchPage(url);
      const courses = parseCoursesFromMarkdown(html, uni.name);
      
      if (courses.length > 0) {
        allSql.push(`\n-- ${uni.name} (${courses.length} courses)`);
        allSql.push(`INSERT INTO public.courses (title, university_id, degree_level, tuition_fee, duration, intake_months, overview) VALUES`);
        
        const valueLines = courses.map(c => {
          const intakeJson = JSON.stringify(c.intake_months);
          const overview = `${c.title}. Annual tuition: MYR ${c.tuition_myr.toLocaleString()} (approx. USD ${c.tuition_fee.toLocaleString()}).`;
          return `  ('${sqlEscape(c.title)}', (SELECT id FROM public.universities WHERE name = '${sqlEscape(uni.name)}' LIMIT 1), '${c.degree_level}', ${c.tuition_fee}, '${c.duration}', '${intakeJson}'::jsonb, '${sqlEscape(overview)}')`;
        });
        
        allSql.push(valueLines.join(",\n") + ";\n");
        totalCourses += courses.length;
      }
      
      console.log(` ${courses.length} courses ✓`);
    } catch (err) {
      console.log(` ✗ Error: ${err.message.slice(0, 60)}`);
    }
    
    // Polite delay
    await new Promise(r => setTimeout(r, 300));
  }
  
  // Summary query
  allSql.push("\n-- Verification");
  allSql.push("SELECT u.name, COUNT(c.id) as course_count");
  allSql.push("FROM universities u");
  allSql.push("LEFT JOIN courses c ON c.university_id = u.id");
  allSql.push("GROUP BY u.name");
  allSql.push("ORDER BY course_count DESC;");
  
  // Write to file
  const outputPath = join(__dirname, "import-courses.sql");
  writeFileSync(outputPath, allSql.join("\n"), "utf8");
  
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  Total courses: ${totalCourses}`);
  console.log(`  Output: ${outputPath}`);
  console.log(`═══════════════════════════════════════════════════`);
}

main().catch(console.error);
