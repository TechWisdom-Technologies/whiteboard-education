/**
 * Scrape universities + courses from en.your-uni.com
 * and insert into Supabase.
 *
 * Usage:  node scripts/scrape-youruni.mjs
 */

const SUPABASE_URL = "https://vvfxsavdmlpgwwumnpqb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2ZnhzYXZkbWxwZ3d3dW1ucHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQ4NDMsImV4cCI6MjA4OTMyMDg0M30.LJcF10ulxXtgwkreUv6SMp_zrrjdCJqHfQy2pxUl5SU";
const BASE = "https://en.your-uni.com";

// ── helpers ──────────────────────────────────────────────────
async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  return res.text();
}

function extractText(html, startTag, endTag) {
  const i = html.indexOf(startTag);
  if (i === -1) return "";
  const j = html.indexOf(endTag, i + startTag.length);
  if (j === -1) return "";
  return html.slice(i + startTag.length, j).trim();
}

// ── Supabase REST helpers ────────────────────────────────────
async function supabaseSelect(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}

async function supabaseUpsert(table, rows) {
  const CHUNK = 200;
  let total = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`  ✗ Upsert ${table} chunk ${i}-${i + chunk.length} failed:`, err);
    } else {
      total += chunk.length;
    }
  }
  return total;
}

// ── Parse university list HTML ───────────────────────────────
function parseUniversityList(html) {
  const unis = [];
  // Match links like: <a ... href="/university/xxx"> ... name ... city,Malaysia ... N courses </a>
  const linkRe = /href="\/university\/([^"]+)"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)<\/a>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const slug = m[1];
    const inner = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    // Skip nav/footer links that don't have course counts
    if (!/\d+\s*courses?/i.test(inner)) continue;

    // Extract course count
    const countMatch = inner.match(/(\d+)\s*courses?/i);
    const courseCount = countMatch ? parseInt(countMatch[1]) : 0;

    // Extract city - look for pattern "City,Malaysia"
    const cityMatch = inner.match(/([A-Za-z\s]+),\s*Malaysia/);
    const city = cityMatch ? cityMatch[1].trim() : "";

    // Extract name - everything before the city
    let name = inner;
    if (cityMatch) {
      name = inner.slice(0, inner.indexOf(cityMatch[0])).trim();
    }
    // Clean up name
    name = name.replace(/Free Offer Letter.*$/i, "").replace(/Offer Letter Fees Applies.*$/i, "").trim();

    if (name && slug && !unis.find((u) => u.slug === slug)) {
      unis.push({ slug, name, city, courseCount });
    }
  }
  return unis;
}

// ── Parse a single university detail page ────────────────────
function parseUniversityDetail(html, slug) {
  const detail = {};

  // Try to get description from meta tag
  const descMatch = html.match(/<meta\s+(?:name|property)="(?:og:)?description"\s+content="([^"]+)"/i);
  detail.description = descMatch ? descMatch[1] : "";

  // Try to get logo/hero image from og:image
  const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  detail.hero_image = ogImgMatch ? ogImgMatch[1] : "";

  // Parse FAQ content if available
  const faqs = [];
  // Simple FAQ extraction - look for FAQ section patterns
  const faqSection = html.match(/Frequently Asked Questions[^]*?(?=Similar to|$)/i);
  if (faqSection) {
    // Just store description as about_text
  }

  detail.faqs = faqs;

  return detail;
}

// ── Parse courses from a university page ─────────────────────
function parseCourses(html) {
  const courses = [];
  // Pattern: [Course TitleUniversity NameMYR xxx/Year • ... • Duration • Intakes](link)
  // The HTML has course cards with structured data in the link text
  const courseRe = /href="[^"]*"[^>]*>([^<]*(?:<[^>]+>[^<]*)*?)MYR\s+([\d,]+)\/Year[^<]*?•[^<]*?([\d.]+)\s*Years?[^<]*?•\s*([A-Za-z,\s&]+)\s*Intake/gi;
  let m;
  while ((m = courseRe.exec(html)) !== null) {
    const rawTitle = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const fee = parseInt(m[2].replace(/,/g, ""));
    const duration = parseFloat(m[3]);
    const intakes = m[4].trim();

    // Clean course title - remove university name suffix
    let title = rawTitle;
    // Remove patterns like "UCSI University Malaysia(Kuala Lumpur)" from end of title
    title = title.replace(/[A-Z][a-zA-Z\s]+ University[^)]*(\([^)]+\))?/g, "").trim();
    title = title.replace(/University of [^)]*(\([^)]+\))?/g, "").trim();
    title = title.replace(/\s+/g, " ").trim();

    if (!title) continue;

    // Determine degree level
    let degreeLevel = "Bachelor";
    const tl = title.toLowerCase();
    if (tl.includes("foundation")) degreeLevel = "Foundation";
    else if (tl.includes("diploma")) degreeLevel = "Foundation"; // Diploma mapped to Foundation
    else if (tl.includes("doctor") || tl.includes("phd")) degreeLevel = "PhD";
    else if (tl.includes("master") || tl.includes("postgraduate")) degreeLevel = "Master";

    // Parse intake months
    const intakeMonths = intakes
      .replace(/\s*&\s*/g, ",")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Convert MYR to approximate USD (1 MYR ≈ 0.22 USD)
    const tuitionUsd = Math.round(fee * 0.22);

    courses.push({
      title,
      degree_level: degreeLevel,
      tuition_fee: tuitionUsd,
      tuition_myr: fee,
      duration: `${duration} years`,
      intake_months: intakeMonths,
    });
  }

  return courses;
}

// ── Alternative simpler parser using text patterns ───────────
function parseCoursesFromText(text) {
  const courses = [];
  // Pattern from markdown extraction: "Course TitleUniversity NameMYR xxx/Year • Free/Paid • Duration • Intakes"
  const lines = text.split("\n");
  for (const line of lines) {
    const match = line.match(/\[(.+?)MYR\s+([\d,]+)\/Year\s*•\s*(?:Free Offer Letter|Offer Letter Fees Applies)\s*•\s*([\d.]+)\s*Years?\s*•\s*(.+?)\s*Intake\]/);
    if (!match) continue;

    let rawTitle = match[1].trim();
    const fee = parseInt(match[2].replace(/,/g, ""));
    const duration = parseFloat(match[3]);
    const intakes = match[4].trim();

    // Remove university name from title
    // Pattern: "Course Title" followed by "UCSI University Malaysia" or similar
    rawTitle = rawTitle.replace(/(?:UCSI|MMU|Taylor's|APU|UNITEN|City|Cyberjaya|MAHSA|UTP|SEGi|Limkokwing|Infrastructure|INTI|UniKL|Help|UTAR|Nottingham|MONASH|IUMW|UTM|UTeM|Lincoln|UNIMY|Sunway|MSU|Heriot-Watt|Southampton|Curtin|Swinburne|Xiamen|IMU|Geomatika|NILAI|Wollongong|Newcastle|Universiti Malaya|Kings|TAR UMT|UPM|Universiti Putra)\s*University[^(]*/gi, "").trim();
    rawTitle = rawTitle.replace(/\([^)]*\)\s*$/g, "").trim();
    // Another pass - clean up remaining university references
    rawTitle = rawTitle.replace(/University Malaysia[^(]*/gi, "").trim();
    rawTitle = rawTitle.replace(/University of [^(]*/gi, "").trim();
    rawTitle = rawTitle.replace(/University College[^(]*/gi, "").trim();
    rawTitle = rawTitle.replace(/\s+/g, " ").trim();

    if (!rawTitle || rawTitle.length < 3) continue;

    let degreeLevel = "Bachelor";
    const tl = rawTitle.toLowerCase();
    if (tl.includes("foundation")) degreeLevel = "Foundation";
    else if (tl.includes("diploma") || tl.includes("certificate")) degreeLevel = "Foundation";
    else if (tl.includes("doctor") || tl.includes("phd") || tl.startsWith("industrial phd")) degreeLevel = "PhD";
    else if (tl.includes("master") || tl.includes("postgraduate") || tl.startsWith("m.")) degreeLevel = "Master";

    const intakeMonths = intakes
      .replace(/\s*&\s*/g, ",")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const tuitionUsd = Math.round(fee * 0.22);

    courses.push({
      title: rawTitle,
      degree_level: degreeLevel,
      tuition_fee: tuitionUsd,
      tuition_myr: fee,
      duration: duration === 1 ? "1 year" : `${duration} years`,
      intake_months: intakeMonths,
    });
  }
  return courses;
}

// ── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  YourUni → Whiteboard Education Data Importer   ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // Step 1: Get or create Malaysia country
  console.log("▸ Step 1: Checking countries table...");
  const countries = await supabaseSelect("countries");
  let malaysiaId = null;
  if (Array.isArray(countries)) {
    const my = countries.find((c) => c.name?.toLowerCase() === "malaysia");
    if (my) {
      malaysiaId = my.id;
      console.log(`  ✓ Found Malaysia (id: ${malaysiaId})`);
    }
  }
  if (!malaysiaId) {
    console.log("  ⚠ Malaysia not found in countries table. Will insert without country_id.");
  }

  // Step 2: Fetch university list (pages 1-4)
  console.log("\n▸ Step 2: Fetching university list...");
  let allUnis = [];
  for (let page = 1; page <= 4; page++) {
    const url = `${BASE}/university-list?page=${page}`;
    console.log(`  Fetching page ${page}...`);
    const html = await fetchPage(url);
    const parsed = parseUniversityList(html);
    allUnis = allUnis.concat(parsed);
    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 500));
  }
  // Deduplicate by slug
  const uniMap = new Map();
  for (const u of allUnis) {
    if (!uniMap.has(u.slug)) uniMap.set(u.slug, u);
  }
  allUnis = [...uniMap.values()];
  console.log(`  ✓ Found ${allUnis.length} universities\n`);

  // Step 3: For each university, fetch detail page and courses
  console.log("▸ Step 3: Fetching university details + courses...");
  const universityRows = [];
  const allCourseRows = [];

  for (let i = 0; i < allUnis.length; i++) {
    const uni = allUnis[i];
    console.log(`  [${i + 1}/${allUnis.length}] ${uni.name} (${uni.courseCount} courses)...`);

    try {
      // Fetch university overview page
      const overviewUrl = `${BASE}/university/${uni.slug}`;
      const overviewHtml = await fetchPage(overviewUrl);
      const detail = parseUniversityDetail(overviewHtml, uni.slug);

      // Build university row
      const uniRow = {
        name: uni.name,
        city: uni.city,
        description: detail.description || `${uni.name} - Study in Malaysia`,
        about_text: detail.description || "",
        ranking: i + 1, // Relative ranking based on listing order
        logo_url: detail.hero_image || "",
        hero_image: detail.hero_image || "",
        ...(malaysiaId ? { country_id: malaysiaId } : {}),
      };
      universityRows.push(uniRow);

      // Fetch course page (it's the same page, courses are listed there)
      // The overview page already has the courses embedded
      const courses = parseCoursesFromText(
        overviewHtml
          .replace(/<a\s+/gi, "\n[")
          .replace(/href="/gi, '](')
          .replace(/">/gi, ") ")
          .replace(/<\/a>/gi, "")
          .replace(/<[^>]+>/g, "")
      );

      // If we didn't get courses from HTML parsing, try fetching the markdown version
      if (courses.length === 0) {
        // Retry with a different parsing approach on raw HTML
        const altCourses = parseCourses(overviewHtml);
        if (altCourses.length > 0) {
          for (const c of altCourses) {
            allCourseRows.push({ ...c, _uniName: uni.name, _uniSlug: uni.slug });
          }
        }
      } else {
        for (const c of courses) {
          allCourseRows.push({ ...c, _uniName: uni.name, _uniSlug: uni.slug });
        }
      }

      console.log(`    ✓ ${courses.length} courses parsed`);
    } catch (err) {
      console.error(`    ✗ Error: ${err.message}`);
    }

    // Be polite - 300ms delay between requests
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n  Total universities: ${universityRows.length}`);
  console.log(`  Total courses: ${allCourseRows.length}\n`);

  // Step 4: Insert universities into Supabase
  console.log("▸ Step 4: Inserting universities...");
  // First clear existing data (optional - comment out if you want to append)
  const uniResult = await supabaseUpsert("universities", universityRows);
  console.log(`  ✓ Inserted ${uniResult} universities\n`);

  // Step 5: Get inserted universities to map IDs
  console.log("▸ Step 5: Mapping university IDs for courses...");
  await new Promise((r) => setTimeout(r, 1000));
  const insertedUnis = await supabaseSelect("universities");
  const uniNameToId = new Map();
  if (Array.isArray(insertedUnis)) {
    for (const u of insertedUnis) {
      uniNameToId.set(u.name, u.id);
    }
  }
  console.log(`  ✓ Mapped ${uniNameToId.size} universities\n`);

  // Step 6: Insert courses
  console.log("▸ Step 6: Inserting courses...");
  const courseRows = allCourseRows
    .map((c) => {
      const uniId = uniNameToId.get(c._uniName);
      if (!uniId) {
        console.log(`  ⚠ No university ID found for: ${c._uniName}`);
        return null;
      }
      return {
        title: c.title,
        university_id: uniId,
        degree_level: c.degree_level,
        tuition_fee: c.tuition_fee,
        duration: c.duration,
        intake_months: c.intake_months,
        overview: `${c.title} at ${c._uniName}. Tuition: MYR ${c.tuition_myr?.toLocaleString()}/year.`,
      };
    })
    .filter(Boolean);

  if (courseRows.length > 0) {
    const courseResult = await supabaseUpsert("courses", courseRows);
    console.log(`  ✓ Inserted ${courseResult} courses\n`);
  } else {
    console.log("  ⚠ No courses to insert. Will try fetching from markdown URLs...\n");
  }

  console.log("═══════════════════════════════════════════════════");
  console.log(`  DONE! ${universityRows.length} universities, ${courseRows.length} courses`);
  console.log("═══════════════════════════════════════════════════");
}

main().catch(console.error);
