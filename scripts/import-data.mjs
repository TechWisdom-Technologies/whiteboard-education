/**
 * Import universities + courses into Supabase
 * Uses read_url_content markdown extraction approach
 *
 * Usage:  node scripts/import-data.mjs
 */

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";
const BASE = "https://en.your-uni.com";

// ── All 42 universities from browser extraction ──────────────
const UNIVERSITIES = [
  { name: "Multimedia University Malaysia (MMU)", city: "Selangor", courseCount: 76, slug: "mmu-university" },
  { name: "UCSI University Malaysia", city: "Kuala Lumpur", courseCount: 128, slug: "ucsi-university" },
  { name: "Taylor's University Malaysia", city: "Selangor", courseCount: 130, slug: "taylor-university-malaysia" },
  { name: "APU University Malaysia", city: "Kuala Lumpur", courseCount: 112, slug: "apu-university" },
  { name: "UNITEN University Malaysia", city: "Selangor", courseCount: 75, slug: "uniten-university" },
  { name: "City University Malaysia", city: "Selangor", courseCount: 83, slug: "city-university" },
  { name: "Cyberjaya University Malaysia (UoC)", city: "Selangor", courseCount: 52, slug: "cyberjaya-university" },
  { name: "MAHSA University Malaysia", city: "Selangor", courseCount: 85, slug: "mahsa-university" },
  { name: "UTP University Malaysia", city: "Perak", courseCount: 52, slug: "utp-university" },
  { name: "SEGi University Malaysia", city: "Kuala Lumpur", courseCount: 126, slug: "segi-university" },
  { name: "Limkokwing University Malaysia", city: "Selangor", courseCount: 8, slug: "limkokwing-university" },
  { name: "Infrastructure University Kuala Lumpur (IUKL)", city: "Selangor", courseCount: 67, slug: "iukl-university" },
  { name: "INTI International University Malaysia", city: "Kuala Lumpur", courseCount: 138, slug: "inti-university" },
  { name: "UniKL University Malaysia", city: "Kuala Lumpur", courseCount: 164, slug: "unikl-university" },
  { name: "HELP University Malaysia", city: "Kuala Lumpur", courseCount: 105, slug: "help-university" },
  { name: "Tunku Abdul Rahman University (UTAR)", city: "Perak", courseCount: 136, slug: "utar-university" },
  { name: "Nottingham University Malaysia", city: "Selangor", courseCount: 94, slug: "nottingham-university" },
  { name: "MONASH University Malaysia", city: "Selangor", courseCount: 120, slug: "monash-university" },
  { name: "International University of Malaya-Wales (IUMW)", city: "Kuala Lumpur", courseCount: 24, slug: "iumw-university" },
  { name: "UTM University Malaysia", city: "Johor", courseCount: 254, slug: "utm-university" },
  { name: "UTeM University Malaysia", city: "Malacca", courseCount: 66, slug: "utem-university" },
  { name: "Lincoln University College", city: "Selangor", courseCount: 173, slug: "lincoln-university-college" },
  { name: "University Malaysia of Computer Science & Engineering (UNIMY)", city: "Kuala Lumpur", courseCount: 16, slug: "university-malaysia-of-computer-science-and-engineering-unimy" },
  { name: "Sunway University", city: "Kuala Lumpur", courseCount: 123, slug: "sunway-university" },
  { name: "Management and Science University (MSU)", city: "Selangor", courseCount: 168, slug: "msu-university" },
  { name: "Swinburne University of Technology Sarawak", city: "Sarawak", courseCount: 76, slug: "swinburne-university-of-technology-sarawak" },
  { name: "UTM SPACE University Malaysia", city: "Johor", courseCount: 35, slug: "utm-space-university-malaysia" },
  { name: "Heriot-Watt University Malaysia Campus", city: "Putrajaya", courseCount: 58, slug: "heriot-watt-university-malaysia-campus" },
  { name: "University of Southampton Malaysia", city: "Johor", courseCount: 18, slug: "university-of-southampton" },
  { name: "Curtin University Malaysia", city: "Sarawak", courseCount: 36, slug: "curtin-university-malaysia" },
  { name: "Swinburne University of Technology Sarawak Campus", city: "Sarawak", courseCount: 53, slug: "swinburne-university-of-technology-sarawak-campus" },
  { name: "Xiamen University Malaysia Campus", city: "Selangor", courseCount: 37, slug: "xiamen-university-malaysia-campus" },
  { name: "International Medical University (IMU)", city: "Kuala Lumpur", courseCount: 26, slug: "international-medical-university" },
  { name: "Universiti Geomatika Malaysia", city: "Kuala Lumpur", courseCount: 30, slug: "universiti-geomatika-malaysia" },
  { name: "NILAI University", city: "Negeri Sembilan", courseCount: 47, slug: "nilai-university" },
  { name: "University of Wollongong (UOW) Malaysia", city: "Selangor", courseCount: 89, slug: "university-of-wollongong-uow" },
  { name: "Newcastle University Medicine Malaysia (NUMed)", city: "Johor", courseCount: 3, slug: "-newcastle-university-medicine-malaysia" },
  { name: "Universiti Malaya (UM)", city: "Kuala Lumpur", courseCount: 68, slug: "universiti-malaya-um" },
  { name: "Kings University College Malaysia", city: "Kuala Lumpur", courseCount: 22, slug: "kings-university-college" },
  { name: "Binary University", city: "Selangor", courseCount: 40, slug: "binary-university" },
  { name: "Tunku Abdul Rahman University of Management and Technology (TAR UMT)", city: "Kuala Lumpur", courseCount: 147, slug: "tunku-abdul-rahman-university-of-management-and-technology-tar-umt" },
  { name: "Universiti Putra Malaysia (UPM)", city: "Selangor", courseCount: 748, slug: "upm-university" },
];

// ── helpers ──────────────────────────────────────────────────
async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  return res.text();
}

async function supabaseSelect(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function supabaseInsertBatch(table, rows) {
  const CHUNK = 100;
  let total = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`  ✗ Insert ${table} chunk ${i}–${i + chunk.length} failed:`, err.slice(0, 200));
    } else {
      total += chunk.length;
      process.stdout.write(`  [${total}/${rows.length}]\r`);
    }
  }
  console.log();
  return total;
}

// Parse course lines from the fetched HTML (rendered text from markdown)
function parseCoursesFromHtml(html) {
  const courses = [];
  // Extract all anchor tags with course data
  const regex = /href="[^"]*"[^>]*>([^]*?)<\/a>/gi;
  let match;
  const seen = new Set();

  while ((match = regex.exec(html)) !== null) {
    const inner = match[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

    // Pattern: "Course Title ... MYR xxx/Year • Free/Paid • x.xx Years • Month1,Month2 & Month3 Intake"
    const cm = inner.match(/^(.+?)\s*MYR\s+([\d,]+)\/Year\s*•\s*(?:Free Offer Letter|Offer Letter Fees Applies)\s*•\s*([\d.]+)\s*Years?\s*•\s*(.+?)\s*Intake\s*$/);
    if (!cm) continue;

    let rawTitle = cm[1].trim();
    const feeMyr = parseInt(cm[2].replace(/,/g, ""));
    const duration = parseFloat(cm[3]);
    const intakeStr = cm[4].trim();

    // Remove university name from title - various patterns
    rawTitle = rawTitle
      .replace(/\([A-Za-z\s]+\)\s*$/, "") // trailing (Campus Name)
      .replace(/(?:UCSI|MMU|Taylor'?s?|APU|UNITEN|City|Cyberjaya|MAHSA|UTP|SEGi|Limkokwing|Infrastructure|INTI|UniKL|Help|UTAR|Nottingham|MONASH|IUMW|UTM|UTeM|Lincoln|UNIMY|Sunway|MSU|Heriot-Watt|Southampton|Curtin|Swinburne|Xiamen|IMU|Geomatika|NILAI|Wollongong|Newcastle|NUMed|Kings|Binary|UPM|Universiti\s+Putra|Universiti\s+Malaya|TAR\s+UMT|Tunku\s+Abdul\s+Rahman|UOW)\s*University[^(]*/gi, "")
      .replace(/University\s+(?:Malaysia|of\s+\w+)[^(]*/gi, "")
      .replace(/University\s+College[^(]*/gi, "")
      .replace(/\s*\([^)]*\)\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!rawTitle || rawTitle.length < 3) continue;
    
    // Deduplicate by title
    const key = rawTitle.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    // Determine degree level
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
      .map((s) => s.trim())
      .filter(Boolean);

    // Convert MYR to approximate USD (1 MYR ≈ 0.22 USD)
    const tuitionUsd = Math.round(feeMyr * 0.22);

    courses.push({
      title: rawTitle,
      degree_level: degreeLevel,
      tuition_fee: tuitionUsd,
      duration: duration === 1 ? "1 year" : `${duration} years`,
      intake_months: intakeMonths,
      overview: `${rawTitle}. Annual tuition: MYR ${feeMyr.toLocaleString()} (approx. USD ${tuitionUsd.toLocaleString()}).`,
    });
  }
  return courses;
}

// ── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Whiteboard Education — Data Import             ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Step 1: Get Malaysia country_id
  console.log("▸ Step 1: Getting Malaysia country_id...");
  const countries = await supabaseSelect("countries");
  let malaysiaId = null;
  if (Array.isArray(countries)) {
    const my = countries.find((c) => c.name?.toLowerCase() === "malaysia");
    if (my) {
      malaysiaId = my.id;
      console.log(`  ✓ Malaysia ID: ${malaysiaId}\n`);
    }
  }

  // Step 2: Insert all universities
  console.log("▸ Step 2: Inserting 42 universities...");
  const uniRows = UNIVERSITIES.map((u, i) => ({
    name: u.name,
    city: u.city,
    description: `${u.name} offers ${u.courseCount} programs for international students in Malaysia.`,
    about_text: `${u.name} is a leading institution in ${u.city}, Malaysia, offering ${u.courseCount} programs across Foundation, Bachelor, Master, and PhD levels for international students.`,
    ranking: i + 1,
    ...(malaysiaId ? { country_id: malaysiaId } : {}),
  }));

  const uniCount = await supabaseInsertBatch("universities", uniRows);
  console.log(`  ✓ Inserted ${uniCount} universities\n`);

  // Step 3: Map university names to IDs
  console.log("▸ Step 3: Mapping university IDs...");
  await new Promise((r) => setTimeout(r, 1000));
  const insertedUnis = await supabaseSelect("universities");
  const nameToId = new Map();
  if (Array.isArray(insertedUnis)) {
    for (const u of insertedUnis) {
      nameToId.set(u.name, u.id);
    }
  }
  console.log(`  ✓ ${nameToId.size} universities mapped\n`);

  // Step 4: Fetch courses for each university
  console.log("▸ Step 4: Fetching & parsing courses for each university...");
  let totalCourses = 0;
  let failedUnis = [];

  for (let i = 0; i < UNIVERSITIES.length; i++) {
    const uni = UNIVERSITIES[i];
    const uniId = nameToId.get(uni.name);
    if (!uniId) {
      console.log(`  ✗ [${i + 1}] ${uni.name} — no ID found, skipping`);
      failedUnis.push(uni.name);
      continue;
    }

    process.stdout.write(`  [${i + 1}/${UNIVERSITIES.length}] ${uni.name}...`);

    try {
      const url = `${BASE}/university/${uni.slug}`;
      const html = await fetchText(url);
      const courses = parseCoursesFromHtml(html);

      if (courses.length > 0) {
        const courseRows = courses.map((c) => ({
          ...c,
          university_id: uniId,
        }));
        const inserted = await supabaseInsertBatch("courses", courseRows);
        totalCourses += inserted;
        console.log(`  ✓ ${inserted} courses`);
      } else {
        console.log(`  ⚠ 0 courses parsed`);
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
      failedUnis.push(uni.name);
    }

    // Polite delay
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  ✓ Universities: ${uniCount}`);
  console.log(`  ✓ Courses: ${totalCourses}`);
  if (failedUnis.length > 0) {
    console.log(`  ⚠ Failed: ${failedUnis.join(", ")}`);
  }
  console.log("═══════════════════════════════════════════════════");
}

main().catch(console.error);
