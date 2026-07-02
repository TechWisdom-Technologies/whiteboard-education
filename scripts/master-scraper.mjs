/**
 * YourUni Master Scraper - Complete Data Extractor
 * Usage:  node scripts/master-scraper.mjs
 * Flags:
 *   --no-images     Skip image downloads
 *   --no-details    Skip individual course detail pages
 *   --uni=mmu       Scrape only one university (by slug keyword)
 *   --concurrency=5 Set concurrency (default: 6)
 */

import { writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://en.your-uni.com';
const OUTPUT_DIR = join(__dirname, '..', 'scraped-data');
const IMAGES_DIR = join(OUTPUT_DIR, 'images');
const LOGOS_DIR = join(IMAGES_DIR, 'logos');
const ACCOMMODATION_IMAGES_DIR = join(IMAGES_DIR, 'accommodation');

const args = process.argv.slice(2);
const SKIP_IMAGES = args.includes('--no-images');
const SKIP_DETAILS = args.includes('--no-details');
const UNI_FILTER = (args.find(a => a.startsWith('--uni=')) || '').split('=')[1] || null;
const CONCURRENCY = parseInt((args.find(a => a.startsWith('--concurrency=')) || '--concurrency=6').split('=')[1]);

const UNIVERSITIES = [
  { name: 'Multimedia University Malaysia (MMU)', city: 'Selangor', slug: 'mmu-university' },
  { name: 'UCSI University Malaysia', city: 'Kuala Lumpur', slug: 'ucsi-university' },
  { name: "Taylor's University Malaysia", city: 'Selangor', slug: 'taylor-university-malaysia' },
  { name: 'APU University Malaysia', city: 'Kuala Lumpur', slug: 'apu-university' },
  { name: 'UNITEN University Malaysia', city: 'Selangor', slug: 'uniten-university' },
  { name: 'City University Malaysia', city: 'Selangor', slug: 'city-university' },
  { name: 'Cyberjaya University Malaysia (UoC)', city: 'Selangor', slug: 'cyberjaya-university' },
  { name: 'MAHSA University Malaysia', city: 'Selangor', slug: 'mahsa-university' },
  { name: 'UTP University Malaysia', city: 'Perak', slug: 'utp-university' },
  { name: 'SEGi University Malaysia', city: 'Kuala Lumpur', slug: 'segi-university' },
  { name: 'Limkokwing University Malaysia', city: 'Selangor', slug: 'limkokwing-university' },
  { name: 'Infrastructure University Kuala Lumpur (IUKL)', city: 'Selangor', slug: 'iukl-university' },
  { name: 'INTI International University Malaysia', city: 'Kuala Lumpur', slug: 'inti-university' },
  { name: 'UniKL University Malaysia', city: 'Kuala Lumpur', slug: 'unikl-university' },
  { name: 'HELP University Malaysia', city: 'Kuala Lumpur', slug: 'help-university' },
  { name: 'Tunku Abdul Rahman University (UTAR)', city: 'Perak', slug: 'utar-university' },
  { name: 'Nottingham University Malaysia', city: 'Selangor', slug: 'nottingham-university' },
  { name: 'MONASH University Malaysia', city: 'Selangor', slug: 'monash-university' },
  { name: 'International University of Malaya-Wales (IUMW)', city: 'Kuala Lumpur', slug: 'iumw-university' },
  { name: 'UTM University Malaysia', city: 'Johor', slug: 'utm-university' },
  { name: 'UTeM University Malaysia', city: 'Malacca', slug: 'utem-university' },
  { name: 'Lincoln University College', city: 'Selangor', slug: 'lincoln-university-college' },
  { name: 'University Malaysia of Computer Science & Engineering (UNIMY)', city: 'Kuala Lumpur', slug: 'university-malaysia-of-computer-science-and-engineering-unimy' },
  { name: 'Sunway University', city: 'Kuala Lumpur', slug: 'sunway-university' },
  { name: 'Management and Science University (MSU)', city: 'Selangor', slug: 'msu-university' },
  { name: 'Swinburne University of Technology Sarawak', city: 'Sarawak', slug: 'swinburne-university-of-technology-sarawak' },
  { name: 'UTM SPACE University Malaysia', city: 'Johor', slug: 'utm-space-university-malaysia' },
  { name: 'Heriot-Watt University Malaysia Campus', city: 'Putrajaya', slug: 'heriot-watt-university-malaysia-campus' },
  { name: 'University of Southampton Malaysia', city: 'Johor', slug: 'university-of-southampton' },
  { name: 'Curtin University Malaysia', city: 'Sarawak', slug: 'curtin-university-malaysia' },
  { name: 'Swinburne University of Technology Sarawak Campus', city: 'Sarawak', slug: 'swinburne-university-of-technology-sarawak-campus' },
  { name: 'Xiamen University Malaysia Campus', city: 'Selangor', slug: 'xiamen-university-malaysia-campus' },
  { name: 'International Medical University (IMU)', city: 'Kuala Lumpur', slug: 'international-medical-university' },
  { name: 'Universiti Geomatika Malaysia', city: 'Kuala Lumpur', slug: 'universiti-geomatika-malaysia' },
  { name: 'NILAI University', city: 'Negeri Sembilan', slug: 'nilai-university' },
  { name: 'University of Wollongong (UOW) Malaysia', city: 'Selangor', slug: 'university-of-wollongong-uow' },
  { name: 'Newcastle University Medicine Malaysia (NUMed)', city: 'Johor', slug: 'newcastle-university-medicine-malaysia' },
  { name: 'Universiti Malaya (UM)', city: 'Kuala Lumpur', slug: 'universiti-malaya-um' },
  { name: 'Kings University College Malaysia', city: 'Kuala Lumpur', slug: 'kings-university-college' },
  { name: 'Tunku Abdul Rahman University of Management and Technology (TAR UMT)', city: 'Kuala Lumpur', slug: 'tunku-abdul-rahman-university-of-management-and-technology-tar-umt' },
  { name: 'Universiti Putra Malaysia (UPM)', city: 'Selangor', slug: 'upm-university' },
  { name: 'International Islamic University Malaysia (IIUM)', city: 'Kuala Lumpur', slug: 'international-islamic-university-malaysia-iium' },
  { name: 'Universiti Sains Malaysia (USM)', city: 'Penang', slug: 'universiti-sains-malaysia-usm' },
];

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchHtml(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(url, { headers: FETCH_HEADERS, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.text();
    } catch (err) {
      if (attempt === retries) return null;
      await sleep(1500 * attempt);
    }
  }
  return null;
}

async function downloadImage(imageUrl, savePath) {
  if (!imageUrl) return null;
  try {
    const parsedUrl = new URL(imageUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    return new Promise((resolve) => {
      const file = createWriteStream(savePath);
      const req = protocol.get(imageUrl, { headers: { 'User-Agent': FETCH_HEADERS['User-Agent'] }, timeout: 15000 }, (res) => {
        if (res.statusCode !== 200) { file.destroy(); resolve(null); return; }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(savePath); });
      });
      req.on('error', () => { file.destroy(); resolve(null); });
      req.on('timeout', () => { req.destroy(); file.destroy(); resolve(null); });
    });
  } catch { return null; }
}

function cleanCourseTitle(title) {
  return title
    .replace(/\s*\([A-Za-z\s]+\s*Campus\)\s*/gi, '')
    .replace(/\s*\((Kuala Lumpur|Selangor|Kuching|Johor|Sarawak|Perak|Malacca|Putrajaya|Negeri Sembilan|Cyberjaya|Melaka|Springhill)\)\s*/gi, '')
    .replace(/(?:UCSI|MMU|Taylor'?s?|APU|UNITEN|City|Cyberjaya|MAHSA|UTP|SEGi|Limkokwing|Infrastructure|INTI|UniKL|Help|UTAR|Nottingham|MONASH|IUMW|UTM|UTeM|Lincoln|UNIMY|Sunway|MSU|Heriot-Watt|Southampton|Curtin|Swinburne|Xiamen|IMU|Geomatika|NILAI|Wollongong|Newcastle|NUMed|Kings|Binary|UPM|UOW|IUKL|IIUM|USM)\s*University[^(]*/gi, '')
    .replace(/Multimedia\s+University\s*(?:Malaysia)?\s*(?:\([^)]+\))?\s*/gi, '')
    .replace(/Universiti\s+(?:Putra|Malaya|Geomatika|Teknologi|Sains|Tenaga)\s*(?:Malaysia|Nasional)?\s*/gi, '')
    .replace(/University\s+(?:Malaysia|of\s+\w+)[^(]*/gi, '')
    .replace(/University\s+College[^(]*/gi, '')
    .replace(/Tunku\s+Abdul\s+Rahman[^(]*/gi, '')
    .replace(/Management\s+and\s+Science[^(]*/gi, '')
    .replace(/International\s+Medical[^(]*/gi, '')
    .replace(/International\s+Islamic[^(]*/gi, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyDegree(title) {
  const tl = title.toLowerCase();
  if (tl.startsWith('foundation') || tl.includes('foundation in')) return 'Foundation';
  if (tl.includes('diploma') || tl.includes('certificate') || tl.includes('advanced diploma')) return 'Diploma';
  if (tl.includes('doctor') || tl.includes('phd') || tl.startsWith('industrial phd')) return 'PhD';
  if (tl.includes('master') || tl.includes('postgraduate') || tl.includes('m.phil') || tl.includes('mba') || tl.startsWith('m.')) return 'Master';
  return 'Bachelor';
}

function safeFilename(str) {
  return str.replace(/[^a-z0-9-_]/gi, '-').replace(/-+/g, '-').toLowerCase().slice(0, 80);
}

function parseUniversityOverview(html, uniSlug) {
  const $ = cheerio.load(html);
  const result = {
    description: '',
    about_text: '',
    logo_url: '',
    qs_ranking: '',
    ielts_undergraduate: '',
    ielts_postgraduate: '',
    required_documents: [],
    campus_locations: [],
    courses: [],
  };

  result.logo_url = $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content') || '';
  result.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';

  // About text from main h2 section
  const aboutParts = [];
  $('h2').each((i, el) => {
    if ($(el).text().toLowerCase().includes('study at')) {
      let next = $(el).next();
      for (let j = 0; j < 5 && next.length; j++) {
        const t = next.text().trim();
        if (t && t.length > 50 && !t.includes('javascript:')) aboutParts.push(t);
        next = next.next();
        if (next.is('h2')) break;
      }
    }
  });
  result.about_text = aboutParts.join('\n\n').trim();

  // QS ranking
  const fullText = $.text();
  const qsMatch = fullText.match(/ranked(?:\s+among)?\s+(?:the\s+)?top\s+(\d+)/i);
  if (qsMatch) result.qs_ranking = `Top ${qsMatch[1]}`;

  // IELTS
  const ieltsUg = fullText.match(/undergraduate[^\n]*?band\s+([0-9.]+)/i);
  if (ieltsUg) result.ielts_undergraduate = `Band ${ieltsUg[1]}`;
  const ieltsPg = fullText.match(/postgraduate[^\n]*?band\s+([0-9.]+)/i);
  if (ieltsPg) result.ielts_postgraduate = `Band ${ieltsPg[1]}`;

  // Required docs
  const docKeywords = ['passport', 'photo', 'certificate', 'transcript', 'result', 'academic'];
  const docSet = new Set();
  $('li').each((i, el) => {
    const t = $(el).text().trim();
    if (docKeywords.some(k => t.toLowerCase().includes(k)) && t.length < 200) docSet.add(t);
  });
  result.required_documents = [...docSet].slice(0, 10);

  // Campus locations
  const campusMatches = fullText.match(/(?:\d+\.\s+)?(?:The\s+)?(?:main\s+)?campus[^.]+\./gi) || [];
  result.campus_locations = campusMatches.slice(0, 5).map(m => m.trim());

  // Parse course links
  const courseLinks = new Map();
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const courseMatch = href.match(/(?:^|\/)university\/([^/]+)\/([^/\?]+)\/?$/);
    if (!courseMatch) return;
    const linkUniSlug = courseMatch[1];
    const courseSlug = courseMatch[2];
    const skipSlugs = new Set(['course', 'accommodation', 'articles', 'contact-us', 'blog',
      'university-list', 'course-list', 'language-center-list', 'service-list',
      'terms-and-conditions', 'privacy-policy', 'refund-policy']);
    if (skipSlugs.has(courseSlug)) return;
    if (linkUniSlug !== uniSlug) return;
    if (courseLinks.has(courseSlug)) return;

    const linkText = $(el).text().replace(/\s+/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
    const cm = linkText.match(/^(.+?)\s*MYR\s+([\d,]+)\/Year\s*\u2022\s*(Free Offer Letter|Offer Letter Fees Applies)\s*\u2022\s*([\d.]+)\s*Years?\s*\u2022\s*(.+?)\s*Intake\s*$/);
    if (!cm) return;

    let rawTitle = cm[1].trim();
    const tuitionMyr = parseInt(cm[2].replace(/,/g, ''));
    const offerLetter = cm[3] === 'Free Offer Letter' ? 'Free' : 'Fees Applies';
    const durationYears = parseFloat(cm[4]);
    const intakeStr = cm[5].trim();
    rawTitle = cleanCourseTitle(rawTitle);
    if (!rawTitle || rawTitle.length < 3) return;

    const intakeMonths = intakeStr.replace(/\s*&\s*/g, ',').split(',').map(s => s.trim()).filter(Boolean);
    const campusMatch2 = linkText.match(/\(([^)]+\s*Campus)\)/i);
    const fullUrl = href.startsWith('http') ? href : `${BASE_URL}/${href.replace(/^\//, '')}`;

    courseLinks.set(courseSlug, {
      title: rawTitle,
      slug: courseSlug,
      url: fullUrl,
      tuition_myr: tuitionMyr,
      tuition_usd: Math.round(tuitionMyr * 0.22),
      duration: durationYears === 1 ? '1 year' : `${durationYears} years`,
      duration_years: durationYears,
      offer_letter: offerLetter,
      intake_months: intakeMonths,
      campus: campusMatch2 ? campusMatch2[1] : '',
      degree_level: classifyDegree(rawTitle),
    });
  });

  result.courses = [...courseLinks.values()];
  return result;
}

function parseCourseDetail(html) {
  if (!html) return null;
  const $ = cheerio.load(html);

  const result = {
    overview_text: '',
    entry_requirements: '',
    career_opportunities: '',
    curriculum: [],
  };

  // Overview paragraphs
  const paras = [];
  $('p').each((i, el) => {
    const t = $(el).text().trim();
    if (t.length > 80 && !t.includes('javascript:') && !t.toLowerCase().includes('fill in your')) paras.push(t);
  });
  result.overview_text = paras.slice(0, 5).join('\n\n').trim();

  if (!result.overview_text) {
    result.overview_text = $('meta[property="og:description"]').attr('content') || '';
  }

  // Entry requirements and career opportunities
  $('h3, h4, h5').each((i, el) => {
    const ht = $(el).text().trim().toLowerCase();
    const getNextText = () => {
      const texts = [];
      let next = $(el).next();
      if (next.length === 0 || (next.length > 0 && !next.text().trim())) {
        next = $(el).parent().next();
      }
      for (let j = 0; j < 5 && next.length; j++) {
        if (next.is('h2,h3,h4,h5,h6')) break;
        const t = next.text().trim();
        if (t && !t.includes('javascript:') && !t.toLowerCase().includes('fill in your')) {
          texts.push(t);
        }
        next = next.next();
      }
      return texts.join('\n\n');
    };
    if (ht.includes('entry requirement') && !result.entry_requirements) result.entry_requirements = getNextText();
    if (ht.includes('career') && !result.career_opportunities) result.career_opportunities = getNextText();
  });

  // Curriculum
  const currMap = new Map();
  $('h4, h5, h6').each((i, el) => {
    const ht = $(el).text().trim();
    if (!/^(Year\s+\d+|Semester\s+\d+|Core|Elective|University|Final Year)/i.test(ht)) return;

    const modules = [];
    const collectFromEl = (cel) => {
      cel.find('li').each((j, li) => {
        const t = $(li).text().trim().replace(/^\u2022\s*/, '');
        if (t && t.length > 2 && t.length < 200) modules.push(t);
      });
      if (modules.length === 0) {
        const raw = cel.text().trim();
        if (raw.includes('\u2022')) {
          raw.split('\u2022').forEach(s => {
            const t = s.trim();
            if (t && t.length > 2 && t.length < 200) modules.push(t);
          });
        }
      }
    };

    let next = $(el).next();
    for (let j = 0; j < 3 && next.length; j++) {
      collectFromEl(next);
      next = next.next();
      if (next.is('h4,h5,h6')) break;
    }

    if (modules.length > 0 && !currMap.has(ht)) {
      currMap.set(ht, [...new Set(modules)]);
    }
  });

  result.curriculum = [...currMap.entries()].map(([year, modules]) => ({ year, modules }));
  return result;
}

function parseAccommodation(html) {
  if (!html) return null;
  const $ = cheerio.load(html);
  const fullText = $.text();

  const result = { description: '', total_count: 0, image_urls: [], local_images: [] };

  const countMatch = fullText.match(/(\d+)\s+nearby accommodations?\s+found/i);
  if (countMatch) result.total_count = parseInt(countMatch[1]);

  const accomParas = [];
  $('p').each((i, el) => {
    const t = $(el).text().trim();
    if (t.toLowerCase().includes('accommodation') && t.length > 30 && t.length < 500) accomParas.push(t);
  });
  result.description = accomParas.slice(0, 3).join('\n\n');

  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src && /\.(jpe?g|png|webp)/i.test(src) && !/(logo|icon|avatar)/i.test(src)) {
      result.image_urls.push(src.startsWith('http') ? src : `${BASE_URL}/${src.replace(/^\//, '')}`);
    }
  });

  $('[style*="background-image"]').each((i, el) => {
    const style = $(el).attr('style') || '';
    const m = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (m) result.image_urls.push(m[1].startsWith('http') ? m[1] : `${BASE_URL}/${m[1].replace(/^\//, '')}`);
  });

  result.image_urls = [...new Set(result.image_urls)].slice(0, 20);
  return result;
}

async function scrapeUniversity(uni, index, total) {
  const t0 = Date.now();
  process.stdout.write(`  [${String(index).padStart(2)}/${total}] ${uni.name.substring(0, 45).padEnd(45)} `);

  const uniData = {
    name: uni.name, city: uni.city, slug: uni.slug,
    url: `${BASE_URL}/university/${uni.slug}`,
    scraped_at: new Date().toISOString(),
    description: '', about_text: '', logo_url: '', logo_local: '',
    qs_ranking: '', ielts_undergraduate: '', ielts_postgraduate: '',
    required_documents: [], campus_locations: [],
    courses: [], total_courses: 0,
    accommodation: null,
  };

  try {
    const html = await fetchHtml(`${BASE_URL}/university/${uni.slug}`);
    if (!html) { console.log('? No HTML'); return uniData; }

    const ov = parseUniversityOverview(html, uni.slug);
    Object.assign(uniData, {
      description: ov.description, about_text: ov.about_text, logo_url: ov.logo_url,
      qs_ranking: ov.qs_ranking, ielts_undergraduate: ov.ielts_undergraduate,
      ielts_postgraduate: ov.ielts_postgraduate, required_documents: ov.required_documents,
      campus_locations: ov.campus_locations,
    });
    uniData.courses = ov.courses;
    uniData.total_courses = ov.courses.length;

    // Logo download
    if (!SKIP_IMAGES && ov.logo_url) {
      const ext = (ov.logo_url.split('.').pop() || 'jpg').split('?')[0].slice(0, 5);
      const logoFile = `${safeFilename(uni.slug)}.${ext}`;
      const downloaded = await downloadImage(ov.logo_url, join(LOGOS_DIR, logoFile));
      if (downloaded) uniData.logo_local = `images/logos/${logoFile}`;
    }

    // Accommodation
    const acHtml = await fetchHtml(`${BASE_URL}/university/${uni.slug}/accommodation`);
    if (acHtml) {
      uniData.accommodation = parseAccommodation(acHtml);
      if (!SKIP_IMAGES && uniData.accommodation?.image_urls?.length > 0) {
        const uniAccomDir = join(ACCOMMODATION_IMAGES_DIR, uni.slug);
        if (!existsSync(uniAccomDir)) mkdirSync(uniAccomDir, { recursive: true });
        const localImgs = [];
        for (let ii = 0; ii < Math.min(uniData.accommodation.image_urls.length, 10); ii++) {
          const imgUrl = uniData.accommodation.image_urls[ii];
          const ext2 = (imgUrl.split('.').pop() || 'jpg').split('?')[0].slice(0, 5);
          const fn = `accom-${ii + 1}.${ext2}`;
          const d = await downloadImage(imgUrl, join(uniAccomDir, fn));
          if (d) localImgs.push(`images/accommodation/${uni.slug}/${fn}`);
        }
        uniData.accommodation.local_images = localImgs;
      }
    }

    // Course details (concurrent)
    if (!SKIP_DETAILS && uniData.courses.length > 0) {
      const lim = pLimit(CONCURRENCY);
      await Promise.all(uniData.courses.map(course => lim(async () => {
        const cHtml = await fetchHtml(course.url);
        if (!cHtml) return;
        const d = parseCourseDetail(cHtml);
        if (d) Object.assign(course, d);
      })));
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`? ${uniData.total_courses} courses (${elapsed}s)`);
  } catch (err) {
    console.log(`? ${err.message}`);
  }

  return uniData;
}

async function main() {
  console.log('\n' + '-'.repeat(65));
  console.log('  ?? YourUni Master Scraper v2.0');
  console.log('-'.repeat(65));
  console.log(`  Images:      ${SKIP_IMAGES ? 'Skipped (--no-images)' : 'Downloading'}`);
  console.log(`  Details:     ${SKIP_DETAILS ? 'Skipped (--no-details)' : 'Full course details'}`);
  console.log(`  Concurrency: ${CONCURRENCY} parallel requests`);
  if (UNI_FILTER) console.log(`  Filter:      ${UNI_FILTER}`);
  console.log('-'.repeat(65) + '\n');

  for (const dir of [OUTPUT_DIR, IMAGES_DIR, LOGOS_DIR, ACCOMMODATION_IMAGES_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  let unis = UNIVERSITIES;
  if (UNI_FILTER) {
    unis = UNIVERSITIES.filter(u => u.slug.includes(UNI_FILTER) || u.name.toLowerCase().includes(UNI_FILTER.toLowerCase()));
    if (unis.length === 0) { console.error(`No university matching: ${UNI_FILTER}`); process.exit(1); }
    console.log(`  Filtered to: ${unis.map(u => u.name).join(', ')}\n`);
  }

  const total = unis.length;
  const t0 = Date.now();
  const allData = [];

  // Scrape universities with limited concurrency (2 at a time to be server-friendly)
  const uniLim = pLimit(2);
  const promises = unis.map((uni, i) => uniLim(async () => {
    const data = await scrapeUniversity(uni, i + 1, total);
    allData.push(data);
    // Intermediate save
    if (allData.length % 5 === 0 || allData.length === total) {
      writeFileSync(join(OUTPUT_DIR, 'universities-temp.json'), JSON.stringify(allData, null, 2), 'utf8');
    }
  }));

  await Promise.all(promises);

  // Sort by original order
  const order = UNIVERSITIES.map(u => u.slug);
  allData.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  // Save outputs
  console.log('\n  Saving outputs...');
  writeFileSync(join(OUTPUT_DIR, 'universities.json'), JSON.stringify(allData, null, 2), 'utf8');

  const summary = allData.map(u => ({
    name: u.name, city: u.city, slug: u.slug, url: u.url,
    logo_url: u.logo_url, logo_local: u.logo_local, description: u.description,
    about_text: u.about_text, qs_ranking: u.qs_ranking,
    ielts_undergraduate: u.ielts_undergraduate, ielts_postgraduate: u.ielts_postgraduate,
    required_documents: u.required_documents, campus_locations: u.campus_locations,
    total_courses: u.total_courses,
    accommodation: u.accommodation ? { 
      description: u.accommodation.description,
      total_count: u.accommodation.total_count,
      local_images: u.accommodation.local_images || [],
    } : null,
    scraped_at: u.scraped_at,
  }));
  writeFileSync(join(OUTPUT_DIR, 'universities-summary.json'), JSON.stringify(summary, null, 2), 'utf8');

  const allCourses = [];
  for (const uni of allData) {
    for (const c of uni.courses) {
      allCourses.push({ university_slug: uni.slug, university_name: uni.name, ...c });
    }
  }
  writeFileSync(join(OUTPUT_DIR, 'courses.json'), JSON.stringify(allCourses, null, 2), 'utf8');

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const totalCourses = allData.reduce((s, u) => s + u.total_courses, 0);
  const withLogo = allData.filter(u => u.logo_url).length;
  const withAccom = allData.filter(u => u.accommodation?.total_count > 0).length;

  console.log('\n' + '-'.repeat(65));
  console.log('  ?? DONE!');
  console.log('-'.repeat(65));
  console.log(`  Universities: ${allData.length}/${total}`);
  console.log(`  Total courses: ${totalCourses}`);
  console.log(`  With logos: ${withLogo}/${allData.length}`);
  console.log(`  With accommodation data: ${withAccom}/${allData.length}`);
  console.log(`  Time: ${elapsed}s`);
  console.log(`\n  Output: ${OUTPUT_DIR}`);
  console.log(`    universities.json       - full data`);
  console.log(`    universities-summary.json - compact (no course details)`);
  console.log(`    courses.json           - flat list of all courses`);
  console.log('-'.repeat(65) + '\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
