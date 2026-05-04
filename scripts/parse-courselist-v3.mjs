/**
 * Parse the MASTER course list + Missing universities
 * 
 * Usage: node scripts/parse-courselist-v3.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const GLOBAL_FILE = "C:\\Users\\FIDBI\\.gemini\\antigravity\\brain\\ab8e3ecf-0c3b-459d-afcf-03477f1bc649\\.system_generated\\steps\\883\\content.md";
const UPM_FILE = "C:\\Users\\FIDBI\\.gemini\\antigravity\\brain\\ab8e3ecf-0c3b-459d-afcf-03477f1bc649\\.system_generated\\steps\\913\\content.md";
const SWINBURNE_FILE = "C:\\Users\\FIDBI\\.gemini\\antigravity\\brain\\ab8e3ecf-0c3b-459d-afcf-03477f1bc649\\.system_generated\\steps\\922\\content.md";
const BINARY_FILE = "C:\\Users\\FIDBI\\.gemini\\antigravity\\brain\\ab8e3ecf-0c3b-459d-afcf-03477f1bc649\\.system_generated\\steps\\925\\content.md";

const DB_UNIVERSITY_NAMES = [
  "Multimedia University Malaysia (MMU)", "UCSI University Malaysia", "Taylor's University Malaysia",
  "APU University Malaysia", "UNITEN University Malaysia", "City University Malaysia",
  "Cyberjaya University Malaysia (UoC)", "MAHSA University Malaysia", "UTP University Malaysia",
  "SEGi University Malaysia", "Limkokwing University Malaysia", "Infrastructure University Kuala Lumpur (IUKL)",
  "INTI International University Malaysia", "UniKL University Malaysia", "HELP University Malaysia",
  "Tunku Abdul Rahman University (UTAR)", "Nottingham University Malaysia", "MONASH University Malaysia",
  "International University of Malaya-Wales (IUMW)", "UTM University Malaysia", "UTeM University Malaysia",
  "Lincoln University College", "University Malaysia of Computer Science & Engineering (UNIMY)",
  "Sunway University", "Management and Science University (MSU)", "Swinburne University of Technology Sarawak",
  "UTM SPACE University Malaysia", "Heriot-Watt University Malaysia Campus", "University of Southampton Malaysia",
  "Curtin University Malaysia", "Swinburne University of Technology Sarawak Campus", "Xiamen University Malaysia Campus",
  "International Medical University (IMU)", "Universiti Geomatika Malaysia", "NILAI University",
  "University of Wollongong (UOW) Malaysia", "Newcastle University Medicine Malaysia (NUMed)",
  "Universiti Malaya (UM)", "Kings University College Malaysia", "Binary University",
  "Tunku Abdul Rahman University of Management and Technology (TAR UMT)", "Universiti Putra Malaysia (UPM)"
];

const UNI_PATTERNS = [
  { pattern: /Multimedia University Malaysia \(MMU\)/i, db: "Multimedia University Malaysia (MMU)" },
  { pattern: /MMU\)/i, db: "Multimedia University Malaysia (MMU)" },
  { pattern: /UCSI University Malaysia/i, db: "UCSI University Malaysia" },
  { pattern: /Taylor'?s University Malaysia/i, db: "Taylor's University Malaysia" },
  { pattern: /APU University Malaysia/i, db: "APU University Malaysia" },
  { pattern: /UNITEN University Malaysia|Universiti Tenaga Nasional/i, db: "UNITEN University Malaysia" },
  { pattern: /City University Malaysia/i, db: "City University Malaysia" },
  { pattern: /Cyberjaya University Malaysia|Cyberjaya University/i, db: "Cyberjaya University Malaysia (UoC)" },
  { pattern: /MAHSA University Malaysia|MAHSA University/i, db: "MAHSA University Malaysia" },
  { pattern: /UTP University Malaysia/i, db: "UTP University Malaysia" },
  { pattern: /SEGi University Malaysia|SEGi University/i, db: "SEGi University Malaysia" },
  { pattern: /Limkokwing University Malaysia|Limkokwing University/i, db: "Limkokwing University Malaysia" },
  { pattern: /Infrastructure University Kuala Lumpur|IUKL/i, db: "Infrastructure University Kuala Lumpur (IUKL)" },
  { pattern: /INTI International University Malaysia|INTI International University/i, db: "INTI International University Malaysia" },
  { pattern: /UniKL University Malaysia/i, db: "UniKL University Malaysia" },
  { pattern: /Help University Malaysia/i, db: "HELP University Malaysia" },
  { pattern: /Tunku Abdul Rahman University of Management and Technology|TAR UMT/i, db: "Tunku Abdul Rahman University of Management and Technology (TAR UMT)" },
  { pattern: /Tunku Abdul Rahman University \(UTAR\)|UTAR\)/i, db: "Tunku Abdul Rahman University (UTAR)" },
  { pattern: /Nottingham University Malaysia/i, db: "Nottingham University Malaysia" },
  { pattern: /MONASH University Malaysia|Monash University/i, db: "MONASH University Malaysia" },
  { pattern: /International University of Malaya-Wales|IUMW/i, db: "International University of Malaya-Wales (IUMW)" },
  { pattern: /UTM SPACE University Malaysia/i, db: "UTM SPACE University Malaysia" },
  { pattern: /UTM University Malaysia/i, db: "UTM University Malaysia" },
  { pattern: /UTeM University Malaysia/i, db: "UTeM University Malaysia" },
  { pattern: /Lincoln University College/i, db: "Lincoln University College" },
  { pattern: /University Malaysia of Computer Science|UNIMY/i, db: "University Malaysia of Computer Science & Engineering (UNIMY)" },
  { pattern: /Sunway University/i, db: "Sunway University" },
  { pattern: /Management and Science University|MSU\)/i, db: "Management and Science University (MSU)" },
  { pattern: /Swinburne University of Technology Sarawak Campus/i, db: "Swinburne University of Technology Sarawak Campus" },
  { pattern: /Swinburne University of Technology Sarawak/i, db: "Swinburne University of Technology Sarawak" },
  { pattern: /Heriot-Watt University Malaysia/i, db: "Heriot-Watt University Malaysia Campus" },
  { pattern: /University of Southampton/i, db: "University of Southampton Malaysia" },
  { pattern: /Curtin University Malaysia|Curtin University/i, db: "Curtin University Malaysia" },
  { pattern: /Xiamen University Malaysia/i, db: "Xiamen University Malaysia Campus" },
  { pattern: /International Medical University|IMU\)/i, db: "International Medical University (IMU)" },
  { pattern: /Universiti Geomatika Malaysia/i, db: "Universiti Geomatika Malaysia" },
  { pattern: /NILAI University/i, db: "NILAI University" },
  { pattern: /University of Wollongong|UOW\)/i, db: "University of Wollongong (UOW) Malaysia" },
  { pattern: /Newcastle University Medicine Malaysia|NUMed/i, db: "Newcastle University Medicine Malaysia (NUMed)" },
  { pattern: /Universiti Malaya \(UM\)/i, db: "Universiti Malaya (UM)" },
  { pattern: /Kings University College/i, db: "Kings University College Malaysia" },
  { pattern: /Binary University/i, db: "Binary University" },
  { pattern: /Universiti Putra Malaysia|UPM\)/i, db: "Universiti Putra Malaysia (UPM)" },
];

function matchUniversity(text) {
  for (const { pattern, db } of UNI_PATTERNS) {
    if (pattern.test(text)) return db;
  }
  return null;
}

function sqlEsc(str) {
  return str.replace(/'/g, "''");
}

function getDegreeLevel(title) {
  const tl = title.toLowerCase();
  if (tl.includes("foundation") || tl.startsWith("cambridge") || tl.startsWith("australian")) return "Foundation";
  if (tl.includes("diploma") || tl.includes("certificate") || tl.startsWith("acca") || tl.startsWith("american degree")) return "Foundation";
  if (tl.includes("doctor") || tl.includes("phd") || tl.startsWith("industrial phd")) return "PhD";
  if (tl.includes("master") || tl.includes("postgraduate") || tl.includes("m.phil") || tl.includes("mba") || tl.startsWith("msc") || tl.startsWith("mphil")) return "Master";
  return "Bachelor";
}

function cleanTitle(title) {
  const inlinePatterns = [
    /Multimedia University Malaysia \(MMU\).*$/i, /UCSI University Malaysia.*$/i, /Taylor'?s University Malaysia\s*$/i,
    /APU University Malaysia.*$/i, /UNITEN University Malaysia.*$/i, /Universiti Tenaga Nasional\)?\s*$/i,
    /City University Malaysia.*$/i, /Cyberjaya University Malaysia.*$/i, /MAHSA University Malaysia.*$/i,
    /UTP University Malaysia.*$/i, /SEGi University Malaysia.*$/i, /Limkokwing University Malaysia.*$/i,
    /Infrastructure University Kuala Lumpur.*$/i, /INTI International University Malaysia.*$/i, /UniKL University Malaysia.*$/i,
    /Help University Malaysia.*$/i, /Tunku Abdul Rahman University of Management and Technology.*$/i,
    /Tunku Abdul Rahman University \(UTAR\).*$/i, /Nottingham University Malaysia.*$/i, /MONASH University Malaysia.*$/i,
    /Monash University Malaysia.*$/i, /International University of Malaya-Wales.*$/i, /UTM SPACE University Malaysia.*$/i,
    /UTM University Malaysia.*$/i, /UTeM University Malaysia.*$/i, /Lincoln University College.*$/i,
    /University Malaysia of Computer Science.*$/i, /Sunway University.*$/i, /Management and Science University.*$/i,
    /Swinburne University of Technology Sarawak.*$/i, /Heriot-Watt University Malaysia.*$/i, /University of Southampton.*$/i,
    /Curtin University Malaysia.*$/i, /Xiamen University Malaysia.*$/i, /International Medical University.*$/i,
    /Universiti Geomatika Malaysia.*$/i, /NILAI University.*$/i, /University of Wollongong.*$/i,
    /Newcastle University Medicine Malaysia.*$/i, /Universiti Malaya \(UM\).*$/i, /Kings University College.*$/i,
    /Binary University.*$/i, /Universiti Putra Malaysia.*$/i,
  ];
  let res = title;
  for (const p of inlinePatterns) res = res.replace(p, "").trim();
  return res.replace(/\s+/g, " ").trim();
}

function parseGlobal(text) {
  const courses = [];
  const linkRegex = /\[([^\]]+?)(MYR\s+[\d,]+\/Year\s*•[^\]]*?Intake)\]\(([^)]+)\)/g;
  let match;
  
  const slugMappings = {
    "mmu-university": "Multimedia University Malaysia (MMU)", "ucsi-university": "UCSI University Malaysia",
    "taylor-university-malaysia": "Taylor's University Malaysia", "apu-university": "APU University Malaysia",
    "uniten-university": "UNITEN University Malaysia", "city-university": "City University Malaysia",
    "cyberjaya-university": "Cyberjaya University Malaysia (UoC)", "mahsa-university": "MAHSA University Malaysia",
    "utp-university": "UTP University Malaysia", "segi-university": "SEGi University Malaysia",
    "limkokwing-university": "Limkokwing University Malaysia", "iukl-university": "Infrastructure University Kuala Lumpur (IUKL)",
    "inti-university": "INTI International University Malaysia", "unikl-university": "UniKL University Malaysia",
    "help-university": "HELP University Malaysia", "utar-university": "Tunku Abdul Rahman University (UTAR)",
    "nottingham-university": "Nottingham University Malaysia", "monash-university": "MONASH University Malaysia",
    "iumw-university": "International University of Malaya-Wales (IUMW)", "utm-university": "UTM University Malaysia",
    "utem-university": "UTeM University Malaysia", "lincoln-university-college": "Lincoln University College",
    "unimy-university": "University Malaysia of Computer Science & Engineering (UNIMY)",
    "sunway-university": "Sunway University", "msu-university": "Management and Science University (MSU)",
    "swinburne-university-of-technology-sarawak-campus": "Swinburne University of Technology Sarawak Campus",
    "utm-space-university-malaysia": "UTM SPACE University Malaysia", "heriot-watt-university-malaysia-campus": "Heriot-Watt University Malaysia Campus",
    "university-of-southampton": "University of Southampton Malaysia", "curtin-university-malaysia": "Curtin University Malaysia",
    "xiamen-university-malaysia-campus": "Xiamen University Malaysia Campus", "international-medical-university": "International Medical University (IMU)",
    "universiti-geomatika-malaysia": "Universiti Geomatika Malaysia", "nilai-university": "NILAI University",
    "university-of-wollongong-uow": "University of Wollongong (UOW) Malaysia", "-newcastle-university-medicine-malaysia": "Newcastle University Medicine Malaysia (NUMed)",
    "universiti-malaya-um": "Universiti Malaya (UM)", "kings-university-college": "Kings University College Malaysia",
    "binary-university": "Binary University", "tunku-abdul-rahman-university-of-management-and-technology-tar-umt": "Tunku Abdul Rahman University of Management and Technology (TAR UMT)",
    "upm-university": "Universiti Putra Malaysia (UPM)", "universiti-putra-malaysia-upm": "Universiti Putra Malaysia (UPM)",
  };

  while ((match = linkRegex.exec(text)) !== null) {
    const beforeMYR = match[1].trim();
    const details = match[2].trim();
    const url = match[3].trim();
    
    const urlMatch = url.match(/\/university\/([^/]+)\//);
    const uniSlug = urlMatch ? urlMatch[1] : "";
    
    const detailMatch = details.match(/MYR\s+([\d,]+)\/Year\s*•\s*(?:Free Offer Letter|Offer Letter Fees Applies)\s*•\s*([\d.]+)\s*Years?\s*•\s*(.+?)\s*Intake/);
    if (!detailMatch) continue;
    
    const feeMyr = parseInt(detailMatch[1].replace(/,/g, ""));
    const duration = parseFloat(detailMatch[2]);
    const intakeStr = detailMatch[3].trim();
    
    let dbUniName = matchUniversity(beforeMYR) || slugMappings[uniSlug];
    if (!dbUniName) continue;
    
    const courseTitle = cleanTitle(beforeMYR);
    if (!courseTitle || courseTitle.length < 3) continue;
    
    courses.push({
      title: courseTitle,
      university: dbUniName,
      degree_level: getDegreeLevel(courseTitle),
      tuition_fee: Math.round(feeMyr * 0.22),
      tuition_myr: feeMyr,
      duration: duration === 1 ? "1 year" : `${duration} years`,
      intake_months: intakeStr.replace(/\s*&\s*/g, ",").split(",").map(s => s.trim()).filter(Boolean),
    });
  }
  return courses;
}

function parseIndividual(text, dbUniName) {
  const courses = [];
  const regex = /\[([^\]]*?MYR\s+[\d,]+\/Year\s*•[^\]]*?Intake)\]\([^)]+\)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const inner = match[1].trim();
    const cm = inner.match(/^(.+?)MYR\s+([\d,]+)\/Year\s*•\s*(?:Free Offer Letter|Offer Letter Fees Applies)\s*•\s*([\d.]+)\s*Years?\s*•\s*(.+?)\s*Intake\s*$/);
    if (!cm) continue;
    
    const rawTitle = cleanTitle(cm[1].trim());
    if (!rawTitle || rawTitle.length < 3) continue;
    
    const feeMyr = parseInt(cm[2].replace(/,/g, ""));
    const duration = parseFloat(cm[3]);
    const intakeStr = cm[4].trim();
    
    courses.push({
      title: rawTitle,
      university: dbUniName,
      degree_level: getDegreeLevel(rawTitle),
      tuition_fee: Math.round(feeMyr * 0.22),
      tuition_myr: feeMyr,
      duration: duration === 1 ? "1 year" : `${duration} years`,
      intake_months: intakeStr.replace(/\s*&\s*/g, ",").split(",").map(s => s.trim()).filter(Boolean),
    });
  }
  return courses;
}

function main() {
  const globalCourses = parseGlobal(readFileSync(GLOBAL_FILE, "utf8"));
  const upmCourses = parseIndividual(readFileSync(UPM_FILE, "utf8"), "Universiti Putra Malaysia (UPM)");
  const swinburneCourses = parseIndividual(readFileSync(SWINBURNE_FILE, "utf8"), "Swinburne University of Technology Sarawak");
  const binaryCourses = parseIndividual(readFileSync(BINARY_FILE, "utf8"), "Binary University");
  
  const allCourses = [...globalCourses, ...upmCourses, ...swinburneCourses, ...binaryCourses];
  
  // Deduplicate by university + title
  const seen = new Set();
  const finalCourses = [];
  for (const c of allCourses) {
    const key = `${c.university}::${c.title.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      finalCourses.push(c);
    }
  }
  
  const uniCounts = {};
  for (const c of finalCourses) uniCounts[c.university] = (uniCounts[c.university] || 0) + 1;
  
  console.log(`Total unique courses: ${finalCourses.length}`);
  const missing = DB_UNIVERSITY_NAMES.filter(n => !uniCounts[n]);
  if (missing.length > 0) console.log("Missing universities: ", missing);
  else console.log("All universities have courses mapped!");
  
  const allSql = [];
  allSql.push("-- ================================================================");
  allSql.push("-- Whiteboard Education: FINAL Course Data Import (v3)");
  allSql.push("-- Total courses: " + finalCourses.length);
  allSql.push("-- ================================================================\n");
  allSql.push("DELETE FROM public.courses;\n");
  
  const byUni = {};
  for (const c of finalCourses) {
    if (!byUni[c.university]) byUni[c.university] = [];
    byUni[c.university].push(c);
  }
  
  for (const [uniName, uniCourses] of Object.entries(byUni)) {
    allSql.push(`\n-- ${uniName} (${uniCourses.length} courses)`);
    for (let i = 0; i < uniCourses.length; i += 50) {
      const batch = uniCourses.slice(i, i + 50);
      allSql.push(`INSERT INTO public.courses (title, university_id, degree_level, tuition_fee, duration, intake_months, overview) VALUES`);
      const valueLines = batch.map(c => {
        const intakeJson = JSON.stringify(c.intake_months);
        const overview = `${c.title}. Annual tuition: MYR ${c.tuition_myr.toLocaleString()} (approx. USD ${c.tuition_fee.toLocaleString()}).`;
        return `  ('${sqlEsc(c.title)}', (SELECT id FROM public.universities WHERE name = '${sqlEsc(c.university)}' LIMIT 1), '${c.degree_level}', ${c.tuition_fee}, '${c.duration}', '${intakeJson}'::jsonb, '${sqlEsc(overview)}')`;
      });
      allSql.push(valueLines.join(",\n") + ";");
    }
  }
  
  const outputPath = join(__dirname, "import-courses.sql");
  writeFileSync(outputPath, allSql.join("\n"), "utf8");
  console.log(`Output written to ${outputPath}`);
}

main();
