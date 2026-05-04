/**
 * Clean import of universities + courses into Supabase
 * Step 1: Delete old courses and universities
 * Step 2: Insert 42 universities
 * Step 3: Fetch each university page, parse courses, insert
 *
 * The site uses client-side rendering, so we fetch the raw HTML 
 * which contains data embedded in the initial page load.
 *
 * Usage:  node scripts/import-clean.mjs
 */

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";
const BASE = "https://en.your-uni.com";

// ── All 42 universities ──────────────────────────────────────
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
async function supabaseRest(method, path, body) {
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${method} ${path}: ${res.status} - ${err.slice(0, 200)}`);
  }
  return res;
}

async function supabaseSelect(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=created_at.desc`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function supabaseInsertBatch(table, rows) {
  const CHUNK = 50;
  let total = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    try {
      await supabaseRest("POST", table, chunk);
      total += chunk.length;
    } catch (err) {
      console.error(`\n  ✗ Batch ${i}–${i + chunk.length}: ${err.message}`);
    }
  }
  return total;
}

// ── Fetch page content with retry ────────────────────────────
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml",
        },
      });
      if (res.ok) return await res.text();
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

// ── Parse courses from raw HTML ──────────────────────────────
function parseCourses(html) {
  const courses = [];
  const seen = new Set();
  
  // The site embeds course data in JSON in the page (Nuxt/Vue SSR data)
  // Try to extract from __NUXT_DATA__ or similar
  const nuxtMatch = html.match(/__NUXT_DATA__\s*=\s*(\[[\s\S]*?\])\s*<\/script>/);
  if (nuxtMatch) {
    try {
      // This is a complex data format, but we can try to extract course info
      const data = JSON.parse(nuxtMatch[1]);
      // Process Nuxt data array
      for (let i = 0; i < data.length; i++) {
        if (typeof data[i] === 'object' && data[i] !== null && data[i].title && data[i].tuition_fee_per_year) {
          const c = data[i];
          courses.push({
            title: c.title || c.name,
            tuition_myr: parseFloat(c.tuition_fee_per_year) || 0,
            duration: c.duration_years ? `${c.duration_years} years` : "3 years",
            intake_months: c.intakes ? c.intakes.split(",").map(s => s.trim()) : [],
            degree_level: classifyDegree(c.title || c.name || ""),
          });
        }
      }
    } catch(e) { /* fallback to regex */ }
  }

  // Fallback: parse from rendered HTML links
  // Course links contain structured text like:
  // "Course Name UniversityName MYR xxx/Year • Free Offer Letter • x.xx Years • Months Intake"
  const linkRegex = /<a[^>]*href="[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const inner = match[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const cm = inner.match(/^(.+?)\s*MYR\s+([\d,]+)\/Year\s*•\s*(?:Free Offer Letter|Offer Letter Fees Applies)\s*•\s*([\d.]+)\s*Years?\s*•\s*(.+?)\s*Intake\s*$/);
    if (!cm) continue;

    let rawTitle = cm[1].trim();
    const feeMyr = parseInt(cm[2].replace(/,/g, ""));
    const duration = parseFloat(cm[3]);
    const intakeStr = cm[4].trim();

    // Clean university name from title
    rawTitle = cleanTitle(rawTitle);
    if (!rawTitle || rawTitle.length < 3) continue;

    const key = rawTitle.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const intakeMonths = intakeStr
      .replace(/\s*&\s*/g, ",")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    courses.push({
      title: rawTitle,
      degree_level: classifyDegree(rawTitle),
      tuition_fee: Math.round(feeMyr * 0.22),
      tuition_myr: feeMyr,
      duration: duration === 1 ? "1 year" : `${duration} years`,
      intake_months: intakeMonths,
    });
  }

  return courses;
}

function cleanTitle(title) {
  return title
    .replace(/\s*\([A-Za-z\s,]+Campus\)\s*$/gi, "")
    .replace(/\s*\((?:Kuala Lumpur|Selangor|Kuching|Springhill|Johor|Sarawak|Perak|Malacca|Putrajaya|Negeri Sembilan)\)\s*/gi, "")
    .replace(/(?:UCSI|MMU|Taylor'?s?|APU|UNITEN|City|Cyberjaya|MAHSA|UTP|SEGi|Limkokwing|Infrastructure|INTI|UniKL|Help|UTAR|Nottingham|MONASH|IUMW|UTM|UTeM|Lincoln|UNIMY|Sunway|MSU|Heriot-Watt|Southampton|Curtin|Swinburne|Xiamen|IMU|Geomatika|NILAI|Wollongong|Newcastle|NUMed|Kings|Binary|UPM|UOW)\s*University[^(]*/gi, "")
    .replace(/Universiti\s+(?:Putra|Malaya|Geomatika|Teknologi)\s*(?:Malaysia)?\s*/gi, "")
    .replace(/University\s+(?:Malaysia|of\s+\w+)[^(]*/gi, "")
    .replace(/University\s+College[^(]*/gi, "")
    .replace(/Tunku\s+Abdul\s+Rahman[^(]*/gi, "")
    .replace(/Management\s+and\s+Science[^(]*/gi, "")
    .replace(/International\s+Medical[^(]*/gi, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyDegree(title) {
  const tl = title.toLowerCase();
  if (tl.includes("foundation")) return "Foundation";
  if (tl.includes("diploma") || tl.includes("certificate") || tl.includes("advanced diploma")) return "Foundation";
  if (tl.includes("doctor") || tl.includes("phd") || tl.startsWith("industrial phd")) return "PhD";
  if (tl.includes("master") || tl.includes("postgraduate") || tl.includes("m.phil") || tl.includes("mba")) return "Master";
  return "Bachelor";
}

// ── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  Whiteboard Education — Clean Data Import       ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Step 1: Get Malaysia country_id
  console.log("▸ Step 1: Getting Malaysia country_id...");
  const countries = await supabaseSelect("countries");
  let malaysiaId = null;
  if (Array.isArray(countries)) {
    const my = countries.find(c => c.name?.toLowerCase() === "malaysia");
    if (my) { malaysiaId = my.id; console.log(`  ✓ Malaysia ID: ${malaysiaId}`); }
  }

  // Step 2: Delete existing courses (they reference universities)
  console.log("\n▸ Step 2: Deleting existing courses...");
  try {
    // Delete all courses (id is not empty = all rows)
    await supabaseRest("DELETE", "courses?id=neq.00000000-0000-0000-0000-000000000000");
    console.log("  ✓ Courses cleared");
  } catch (e) { console.log(`  ⚠ ${e.message}`); }

  // Step 3: Delete existing universities
  console.log("\n▸ Step 3: Deleting existing universities...");
  try {
    await supabaseRest("DELETE", "universities?id=neq.00000000-0000-0000-0000-000000000000");
    console.log("  ✓ Universities cleared");
  } catch (e) { console.log(`  ⚠ ${e.message}`); }

  await new Promise(r => setTimeout(r, 1000));

  // Step 4: Insert all 42 universities
  console.log("\n▸ Step 4: Inserting 42 universities...");
  const uniRows = UNIVERSITIES.map((u, i) => ({
    name: u.name,
    city: u.city,
    description: `${u.name} offers ${u.courseCount} programs for international students in Malaysia.`,
    about_text: `${u.name} is a premier educational institution located in ${u.city}, Malaysia. The university offers ${u.courseCount} programs spanning Foundation, Diploma, Bachelor's, Master's, and PhD levels, serving a diverse community of international students from around the world.`,
    ranking: i + 1,
    ...(malaysiaId ? { country_id: malaysiaId } : {}),
  }));

  const uniCount = await supabaseInsertBatch("universities", uniRows);
  console.log(`  ✓ Inserted ${uniCount} universities`);

  // Step 5: Map university names to IDs
  console.log("\n▸ Step 5: Mapping university IDs...");
  await new Promise(r => setTimeout(r, 1500));
  const insertedUnis = await supabaseSelect("universities");
  const nameToId = new Map();
  if (Array.isArray(insertedUnis)) {
    for (const u of insertedUnis) nameToId.set(u.name, u.id);
  }
  console.log(`  ✓ ${nameToId.size} universities mapped`);

  // Step 6: Fetch & insert courses for each university
  console.log("\n▸ Step 6: Fetching courses for each university...\n");
  let totalCourses = 0;
  const stats = [];

  for (let i = 0; i < UNIVERSITIES.length; i++) {
    const uni = UNIVERSITIES[i];
    const uniId = nameToId.get(uni.name);
    if (!uniId) {
      console.log(`  ✗ [${i + 1}] ${uni.name} — no ID, skipping`);
      stats.push({ name: uni.name, expected: uni.courseCount, actual: 0, status: "no_id" });
      continue;
    }

    process.stdout.write(`  [${i + 1}/${UNIVERSITIES.length}] ${uni.name.substring(0, 40).padEnd(40)}...`);

    try {
      const url = `${BASE}/university/${uni.slug}`;
      const html = await fetchWithRetry(url);
      let courses = parseCourses(html);

      // If no courses parsed from HTML (JS-rendered), create entries from known count
      if (courses.length === 0) {
        // The site is JS-rendered, so we create placeholder courses from the known course count
        // We'll need to use the browser approach for the actual course names
        console.log(` 0 parsed (JS-rendered), will be added via browser`);
        stats.push({ name: uni.name, expected: uni.courseCount, actual: 0, status: "js_rendered" });
        continue;
      }

      const courseRows = courses.map(c => ({
        title: c.title,
        university_id: uniId,
        degree_level: c.degree_level,
        tuition_fee: c.tuition_fee,
        duration: c.duration,
        intake_months: c.intake_months,
        overview: `${c.title}. Annual tuition: MYR ${(c.tuition_myr || 0).toLocaleString()} (approx. USD ${(c.tuition_fee || 0).toLocaleString()}).`,
      }));

      const inserted = await supabaseInsertBatch("courses", courseRows);
      totalCourses += inserted;
      console.log(` ${inserted} courses ✓`);
      stats.push({ name: uni.name, expected: uni.courseCount, actual: inserted, status: "ok" });
    } catch (err) {
      console.log(` ✗ Error: ${err.message.slice(0, 80)}`);
      stats.push({ name: uni.name, expected: uni.courseCount, actual: 0, status: "error" });
    }

    await new Promise(r => setTimeout(r, 400));
  }

  // Summary
  console.log("\n═══════════════════════════════════════════════════");
  console.log(`  Universities inserted: ${uniCount}`);
  console.log(`  Courses inserted: ${totalCourses}`);
  const jsRendered = stats.filter(s => s.status === "js_rendered").length;
  if (jsRendered > 0) {
    console.log(`  JS-rendered universities (need browser): ${jsRendered}`);
    console.log(`  Expected courses from these: ${stats.filter(s => s.status === "js_rendered").reduce((a, b) => a + b.expected, 0)}`);
  }
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch(console.error);
