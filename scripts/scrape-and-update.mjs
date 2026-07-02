import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import pg from 'pg';
import dotenv from 'dotenv';
import pLimit from 'p-limit';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

const BASE_URL = 'https://en.your-uni.com';

// Sleep helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Clean text
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/See More|See Less/gi, '')
    .trim();
}

// Helper: Extract text under a specific heading
function extractTextUnderHeading($, headingText) {
  const header = $('h1, h2, h3, h4, h5, h6').filter((i, el) => {
    return $(el).text().toLowerCase().includes(headingText.toLowerCase());
  }).first();
  
  if (header.length === 0) return '';
  
  let nextNode = header.next();
  let htmlContent = '';
  while (nextNode.length > 0 && !/^h[1-6]$/i.test(nextNode[0].tagName)) {
    const clone = nextNode.clone();
    // Remove buttons, read-more links, etc.
    clone.find('.read-more-bar, .read-less-bar, .read-more-btn, .read-less-btn, button, a:contains("See More"), a:contains("See Less")').remove();
    htmlContent += $.html(clone);
    nextNode = nextNode.next();
  }
  
  let text = cheerio.load(htmlContent).text().trim();
  // Clean up whitespace and line breaks
  text = text.replace(/\s*\n\s*/g, '\n').replace(/\n{2,}/g, '\n\n').trim();
  return text;
}

// Helper: Extract FAQs
function extractFaqs($) {
  const faqs = [];
  
  // Method 1: Look for .faq-details or .collapse.faq-details
  const faqDetails = $('.faq-details, .faq-answer');
  if (faqDetails.length > 0) {
    faqDetails.each((i, el) => {
      const answer = $(el).text().trim();
      if (!answer || answer.toLowerCase() === 'no data') return;
      
      // Find the question, which is typically the preceding sibling
      let question = '';
      let prev = $(el).prev();
      if (prev.length > 0) {
        question = prev.text().trim();
      }
      
      // If not found in immediate sibling, look at prevAll
      if (!question && prev.length > 0) {
        question = $(el).prevAll('button, h3, h4, h5, h6, .faq-accordion, .faq-question').first().text().trim();
      }
      
      const cleanQ = cleanText(question);
      const cleanA = cleanText(answer);
      if (cleanQ && cleanA) {
        faqs.push({ question: cleanQ, answer: cleanA });
      }
    });
  }
  
  // Method 2: If empty, try elementor accordion
  if (faqs.length === 0) {
    $('.elementor-accordion-item').each((i, el) => {
      const question = $(el).find('.elementor-accordion-title').text().trim();
      const answer = $(el).find('.elementor-tab-content').text().trim();
      const cleanQ = cleanText(question);
      const cleanA = cleanText(answer);
      if (cleanQ && cleanA) {
        faqs.push({ question: cleanQ, answer: cleanA });
      }
    });
  }
  
  return faqs;
}

// Helper: Extract Hero Image
function extractHeroImage($) {
  let heroImage = '';
  
  // Check if there is an element with style containing background-image
  $('[style*="background-image"]').each((i, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (match && (match[1].includes('banner') || match[1].includes('hero') || match[1].includes('background') || match[1].includes('cover'))) {
      heroImage = match[1];
      return false; // break
    }
  });
  
  if (heroImage) return heroImage;
  
  // Check img tags
  $('img').each((i, el) => {
    const src = $(el).attr('src') || '';
    if (src.includes('banner') || src.includes('hero') || src.includes('background') || src.includes('cover')) {
      heroImage = src;
      return false; // break
    }
  });
  
  return heroImage;
}

// Helper: Extract Curriculum
function extractCurriculum($) {
  let curriculum = [];
  
  const blacklistModules = [
    'typically replies',
    'submitting your form',
    'contact you',
    'copyright',
    'all rights reserved',
    'chat with us',
    'free offer letter',
    'apply now',
    'ask us',
    'youruni',
    'whatsapp',
    'email to',
    'terms & condition',
    'privacy policy',
    'refund policy'
  ];

  function isBlacklisted(txt) {
    const lower = txt.toLowerCase();
    return blacklistModules.some(term => lower.includes(term));
  }
  
  // STRATEGY 1: Elementor Accordion
  $('.elementor-accordion-item').each((i, el) => {
    const title = cleanText($(el).find('.elementor-accordion-title').text());
    if (title) {
      const modules = [];
      $(el).find('li, td').each((j, item) => {
        const mod = cleanText($(item).text());
        if (mod && mod.length > 2 && !mod.toLowerCase().includes('credit hour') && !mod.toLowerCase().includes('credit value')) {
          modules.push(mod);
        }
      });
      if (modules.length > 0) {
        curriculum.push({ year: title, modules: [...new Set(modules)] });
      }
    }
  });

  if (curriculum.length > 0) return curriculum;

  // STRATEGY 2: Elementor Tabs
  $('.elementor-tab-title').each((i, el) => {
    const title = cleanText($(el).text());
    if (title && /year|semester|trimester|level/i.test(title)) {
      const controlId = $(el).attr('aria-controls') || $(el).attr('id');
      let contentPanel = [];
      if (controlId) {
        contentPanel = $(`[id="${controlId}"], [aria-labelledby="${controlId}"]`);
      }
      if (!contentPanel.length) {
        contentPanel = $(el).next('.elementor-tab-content');
      }
      if (contentPanel.length > 0) {
        const modules = [];
        contentPanel.find('li, p, td').each((j, item) => {
          const mod = cleanText($(item).text());
          if (mod && mod.length > 2 && mod.length < 150 && !mod.toLowerCase().includes('credit hour') && !mod.toLowerCase().includes('credit value')) {
            modules.push(mod);
          }
        });
        if (modules.length > 0) {
          curriculum.push({ year: title, modules: [...new Set(modules)] });
        }
      }
    }
  });

  if (curriculum.length > 0) return curriculum;

  // STRATEGY 4: Collapse Content Panel (for IIUM, UOW, UoC etc.)
  const currBtn = $('.course-details-item-collapse').filter((i, el) => {
    return $(el).text().toLowerCase().includes('curriculum');
  }).first();

  if (currBtn.length > 0) {
    const panel = currBtn.next('.course-details-items-content');
    if (panel.length > 0) {
      let activeYear = '';
      let currentSec = null;

      panel.find('p, li, tr, h3, h4, h5').each((j, el) => {
        const text = cleanText($(el).text());
        const tagName = el.tagName.toLowerCase();
        if (!text) return;

        const isYear = /year\s*\d/i.test(text);
        const isSem = /semester\s*\d|trimester\s*\d/i.test(text);
        const isHeading = isYear || isSem || /^(trimester|level|term|sem|core|elective|university\s+subjects|modules)/i.test(text);

        if (isYear && !isSem) {
          activeYear = text;
        } else if (isSem) {
          const secTitle = activeYear ? `${activeYear} - ${text}` : text;
          currentSec = { year: secTitle, modules: [] };
          curriculum.push(currentSec);
        } else if (isHeading && (tagName !== 'li' && tagName !== 'td')) {
          currentSec = { year: text, modules: [] };
          curriculum.push(currentSec);
        } else {
          if (!currentSec) {
            currentSec = { year: 'Modules', modules: [] };
            curriculum.push(currentSec);
          }

          const htmlContent = $(el).html() || '';
          if (htmlContent.includes('<br')) {
            const items = htmlContent.split(/<br\s*\/?>/gi);
            items.forEach(item => {
              const cleanItem = cleanText(cheerio.load(item).text().replace(/^[•\s\-\*]+/g, ''));
              if (cleanItem && cleanItem.length > 2 && cleanItem.length < 150 && !cleanItem.toLowerCase().includes('credit') && !isBlacklisted(cleanItem)) {
                currentSec.modules.push(cleanItem);
              }
            });
          } else {
            const cleanItem = text.replace(/^[•\s\-\*]+/g, '').trim().replace(/\s+/g, ' ');
            if (cleanItem && cleanItem.length > 2 && cleanItem.length < 150 && !cleanItem.toLowerCase().includes('credit') && !isBlacklisted(cleanItem)) {
              currentSec.modules.push(cleanItem);
            }
          }
        }
      });
    }
  }

  if (curriculum.length > 0) {
    curriculum = curriculum.filter(y => y.modules.length > 0);
    if (curriculum.length > 0) return curriculum;
  }

  // STRATEGY 3: Plain text under "Curriculum" or "Programme Structure" heading using document order
  const allElements = $('*');
  let foundCurriculum = false;
  let currentYear = null;
  
  const stopWords = ['about', 'apply', 'inquiry', 'contact', 'comment', 'location', 'accommodation', 'other courses', 'similar', 'gallery', 'facilities', 'partner', 'review', 'news', 'event', 'register', 'faq', 'why'];

  allElements.each((i, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    
    if (!foundCurriculum) {
      if (/^h[1-3]$/.test(tagName) && text.toLowerCase() === 'curriculum') {
        foundCurriculum = true;
      }
      return;
    }

    // Stop if we hit a new major section (another h1 or h2)
    if (/^h[1-2]$/.test(tagName)) {
      foundCurriculum = false;
      return;
    }

    // Stop if we hit any header containing stop-words
    if (/^h[1-6]$/.test(tagName)) {
      const lowerText = text.toLowerCase();
      if (stopWords.some(word => lowerText.includes(word))) {
        foundCurriculum = false;
        return;
      }
    }

    // Check for year/semester headers (h3, h4, h5)
    if (/^h[3-5]$/.test(tagName)) {
      const lowerText = text.toLowerCase();
      if (/^(year|semester|trimester|level|term|sem|core|elective|university\s+subjects|modules)/i.test(lowerText)) {
        currentYear = { year: text, modules: [] };
        curriculum.push(currentYear);
      }
    }

    // Capture modules
    if (currentYear) {
      if (tagName === 'li') {
        const mod = text.replace(/^[•\s\-\*]+/, '').trim().replace(/\s+/g, ' ');
        if (mod && mod.length > 2 && mod.length < 150 && !mod.toLowerCase().includes('credit') && !isBlacklisted(mod)) {
          currentYear.modules.push(mod);
        }
      }
      else if (tagName === 'td') {
        const mod = text.replace(/^[•\s\-\*]+/, '').trim().replace(/\s+/g, ' ');
        if (mod && mod.length > 2 && mod.length < 150 && !mod.toLowerCase().includes('credit') && !/year\s*\d/i.test(mod) && !isBlacklisted(mod)) {
          currentYear.modules.push(mod);
        }
      }
      else if (tagName === 'p') {
        const htmlContent = $(el).html() || '';
        if (htmlContent.includes('<br')) {
          const items = htmlContent.split(/<br\s*\/?>/gi);
          items.forEach(item => {
            const cleanItem = cheerio.load(item).text().replace(/^[•\s\-\*]+/g, '').trim().replace(/\s+/g, ' ');
            if (cleanItem && cleanItem.length > 2 && cleanItem.length < 150 && !cleanItem.toLowerCase().includes('credit') && !isBlacklisted(cleanItem)) {
              currentYear.modules.push(cleanItem);
            }
          });
        } else {
          const cleanItem = text.replace(/^[•\s\-\*]+/g, '').trim().replace(/\s+/g, ' ');
          if (cleanItem && cleanItem.length > 2 && cleanItem.length < 150 && !cleanItem.toLowerCase().includes('credit') && !/year\s*\d/i.test(cleanItem) && !isBlacklisted(cleanItem)) {
            currentYear.modules.push(cleanItem);
          }
        }
      }
    }
  });

  // Filter out empty years/sections
  curriculum = curriculum.filter(y => y.modules.length > 0);

  return curriculum.length > 0 ? curriculum : null;
}

// Scrape University List Page
async function scrapeUniversityList() {
  const url = `${BASE_URL}/university-list`;
  console.log(`Fetching university list from ${url}...`);
  
  let html = '';
  try {
    const res = await fetch(url);
    if (res.ok) {
      html = await res.text();
    }
  } catch (err) {
    console.error(`Failed to fetch university list from live site: ${err.message}`);
  }

  // Fallback to local file if fetch failed
  if (!html) {
    const localPath = join(__dirname, '../Sample Inspects/Universities/university-list.html');
    if (fs.existsSync(localPath)) {
      console.log(`Loading local university list from ${localPath}...`);
      html = fs.readFileSync(localPath, 'utf8');
    }
  }

  if (!html) {
    console.log('No university list HTML found. Skipping list scraping.');
    return {};
  }

  const $ = cheerio.load(html);
  const cityMap = {};

  $('.uni-list-body, .elementor-post, [class*="university"]').each((i, el) => {
    const linkEl = $(el).find('a[href*="university/"]').first();
    const href = linkEl.attr('href') || '';
    const slugMatch = href.match(/university\/([^/]+)/);
    if (slugMatch) {
      const slug = slugMatch[1];
      const locationText = $(el).find('.uni-location').text().trim();
      if (locationText) {
        // e.g. "Selangor,Malaysia" or "Kuala Lumpur,Malaysia"
        const city = locationText.split(',')[0].trim();
        cityMap[slug] = city;
      }
    }
  });

  console.log(`Found ${Object.keys(cityMap).length} university city mappings.`);
  return cityMap;
}

// Scrape and parse a single university page
async function scrapeUniversityPage(slug, dbName) {
  const url = `${BASE_URL}/university/${slug}`;
  console.log(`Fetching university page: ${url}`);
  
  let html = '';
  
  // For test mode on MMU, load local file if available
  if (slug === 'mmu-university') {
    const localPath = join(__dirname, '../Sample Inspects/Universities/mmu-university.html');
    if (fs.existsSync(localPath)) {
      console.log(`[TEST] Loading local MMU HTML file.`);
      html = fs.readFileSync(localPath, 'utf8');
    }
  }

  if (!html) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        html = await res.text();
      } else {
        console.error(`Failed to fetch ${url}: Status ${res.status}`);
      }
    } catch (err) {
      console.error(`Error fetching ${url}: ${err.message}`);
    }
  }

  if (!html) return null;

  const $ = cheerio.load(html);

  const description = extractTextUnderHeading($, 'About');
  const aboutText = extractTextUnderHeading($, 'Study at') || extractTextUnderHeading($, 'Why Study');
  const faqs = extractFaqs($);
  const heroImage = extractHeroImage($);

  return {
    slug,
    description: description || null,
    aboutText: aboutText || null,
    faqs: faqs.length > 0 ? faqs : null,
    heroImage: heroImage || null,
  };
}

// Helper function to extract text from HTML while preserving block element newlines
function htmlToText($, el) {
  let text = '';
  
  function traverse(node) {
    if (node.type === 'text') {
      text += node.data;
      return;
    }
    
    if (node.type === 'tag') {
      const tagName = node.name.toLowerCase();
      
      if (tagName === 'br') {
        text += '\n';
        return;
      }
      
      const isBlock = ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'tr'].includes(tagName);
      
      if (isBlock && text && !text.endsWith('\n')) {
        text += '\n';
      }
      
      if (node.children) {
        node.children.forEach(traverse);
      }
      
      if (isBlock && !text.endsWith('\n')) {
        text += '\n';
      }
    }
  }
  
  if (el) {
    $(el).each((i, node) => {
      traverse(node);
    });
  }
  
  return text.trim();
}

// Scrape and parse a single course page
async function scrapeCoursePage(uniSlug, courseSlug, dbTitle) {
  const url = `${BASE_URL}/university/${uniSlug}/${courseSlug}`;
  console.log(`Fetching course page: ${url}`);

  let html = '';

  // For test mode on TAR UMT PhD CS, load local file if available
  if (uniSlug === 'tunku-abdul-rahman-university-of-management-and-technology-tar-umt' && courseSlug.includes('doctor-of-philosophy-in-computer-science-by-research-mode')) {
    const localPath = join(__dirname, '../Sample Inspects/Courses/tar-umt-phd-cs.html');
    if (fs.existsSync(localPath)) {
      console.log(`[TEST] Loading local TAR UMT PhD CS HTML file.`);
      html = fs.readFileSync(localPath, 'utf8');
    }
  }

  if (!html) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        html = await res.text();
      } else {
        // Try with trailing slash or without
        const alternativeUrl = url.endsWith('/') ? url.slice(0, -1) : url + '/';
        const resAlt = await fetch(alternativeUrl);
        if (resAlt.ok) {
          html = await resAlt.text();
        } else {
          console.error(`Failed to fetch course: ${url} (Status ${res.status})`);
        }
      }
    } catch (err) {
      console.error(`Error fetching course ${url}: ${err.message}`);
    }
  }

  if (!html) return null;

  const $ = cheerio.load(html);

  // 1. English Requirements
  let englishRequirement = {};
  $('.course-detail-key-info-title').each((i, el) => {
    if ($(el).text().trim() === 'English Requirement') {
      const text = $(el).closest('.row').find('.course-detail-key-info-desc').text().trim();
      if (text) {
        const ieltsMatch = text.match(/IELTS\s*([\d.]+)/i);
        if (ieltsMatch) {
          englishRequirement.ielts = ieltsMatch[1];
        }
        englishRequirement.raw = text;
      }
    }
  });

  // 2. Tuition Fees and Other Fees
  let yearlyFees = [];
  let otherFees = [];
  let tuitionFee = null;

  $('table').each((tableIdx, tableEl) => {
    const rows = [];
    $(tableEl).find('tr').each((rowIdx, trEl) => {
      const cells = [];
      $(trEl).find('td, th').each((cellIdx, tdEl) => {
        const text = $(tdEl).text().trim();
        if (text) {
          cells.push(text);
        }
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });

    let currentSection = null; // 'yearly' or 'other'
    
    for (const row of rows) {
      const rowText = row.join(' ').toLowerCase();
      const col0 = row[0] ? row[0].toLowerCase() : '';
      if (rowText.includes('yearly tuition') || col0 === 'year') {
        currentSection = 'yearly';
        continue;
      }
      if (rowText.includes('other fee') || col0 === 'description' || rowText.includes('no data')) {
        currentSection = 'other';
        continue;
      }

      if (currentSection === 'yearly') {
        if (row.length >= 2) {
          const year = cleanText(row[0]);
          const fee = cleanText(row[1]);
          if (year && fee && year.toLowerCase() !== 'year' && fee.toLowerCase() !== 'fee') {
            yearlyFees.push({ year, fee });
            if (/1st|first/i.test(year) && !tuitionFee) {
              const num = parseFloat(fee.replace(/[^0-9.]/g, ''));
              if (!isNaN(num)) {
                tuitionFee = num;
              }
            }
          }
        }
      } else if (currentSection === 'other') {
        if (row.length >= 2) {
          const description = cleanText(row[0]);
          const fee = cleanText(row[1]);
          if (description && fee && !/^(description|fee|no data)$/i.test(description)) {
            otherFees.push({ description, fee });
          }
        }
      } else {
        // Fallback guess
        if (row.length >= 2) {
          const col1 = cleanText(row[0]);
          const col2 = cleanText(row[1]);
          if (/year/i.test(col1) && !/other/i.test(col1)) {
            const num = parseFloat(col2.replace(/[^0-9.]/g, ''));
            if (!isNaN(num)) {
              yearlyFees.push({ year: col1, fee: col2 });
              if (/1st|first/i.test(col1) && !tuitionFee) {
                tuitionFee = num;
              }
            }
          } else if (col1 && col2 && !/description|fee/i.test(col1)) {
            otherFees.push({ description: col1, fee: col2 });
          }
        }
      }
    }
  });

  if (!tuitionFee && yearlyFees.length > 0) {
    const num = parseFloat(yearlyFees[0].fee.replace(/[^0-9.]/g, ''));
    if (!isNaN(num)) tuitionFee = num;
  }

  // 3. Course Overview
  let overview = '';
  const overviewContainer = $('.course-details-section').first();
  if (overviewContainer.length > 0) {
    const $container = cheerio.load(overviewContainer.html());
    $container('.read-more-bar, .read-less-bar, .read-more-btn, .read-less-btn, button, a:contains("See More"), a:contains("See Less")').remove();
    
    const firstH3 = $container('h3').first();
    if (firstH3.length > 0) {
      const containerHtml = $container.html();
      const h3Html = $.html(firstH3);
      const parts = containerHtml.split(h3Html);
      if (parts.length > 0) {
        overview = cheerio.load(parts[0]).text().trim();
      }
    } else {
      overview = $container.text().trim();
    }
    overview = overview.replace(/\s*\n\s*/g, '\n').replace(/\n{2,}/g, '\n\n').trim();
  }

  // 4. Entry Requirements Text
  let entryRequirementsText = '';
  const entryReqHeader = $('h3').filter((i, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes('entry requirement');
  }).first();
  
  if (entryReqHeader.length > 0) {
    let nextNode = entryReqHeader.next();
    let reqTexts = [];
    while (nextNode.length > 0 && nextNode[0].tagName !== 'h3' && nextNode[0].tagName !== 'h2') {
      const clone = nextNode.clone();
      clone.find('.read-more-bar, .read-less-bar, .read-more-btn, .read-less-btn, button, a:contains("See More"), a:contains("See Less")').remove();
      const txt = htmlToText($, clone);
      if (txt) {
        reqTexts.push(txt);
      }
      nextNode = nextNode.next();
    }
    entryRequirementsText = reqTexts.join('\n\n').trim();
  }

  // 5. Future Careers
  const careerOutcomes = [];
  const careerHeader = $('h3').filter((i, el) => {
    const text = $(el).text().toLowerCase();
    return text.includes('future career') || text.includes('career opportunities') || text.includes('career outcomes') || text.includes('career path');
  }).first();

  if (careerHeader.length > 0) {
    let nextNode = careerHeader.next();
    while (nextNode.length > 0 && nextNode[0].tagName !== 'h3' && nextNode[0].tagName !== 'h2') {
      const clone = nextNode.clone();
      clone.find('.read-more-bar, .read-less-bar, .read-more-btn, .read-less-btn, button, a:contains("See More"), a:contains("See Less")').remove();
      
      if (clone[0].tagName === 'ul' || clone[0].tagName === 'ol') {
        clone.find('li').each((j, li) => {
          const txt = htmlToText($, li);
          if (txt) careerOutcomes.push(txt);
        });
      } else {
        const txt = htmlToText($, clone);
        if (txt) {
          const parts = txt.split('\n\n').map(p => p.trim()).filter(Boolean);
          careerOutcomes.push(...parts);
        }
      }
      nextNode = nextNode.next();
    }
  }

  // 6. Curriculum
  const curriculum = extractCurriculum($);

  // 7. Key Info (Duration and Intake)
  let duration = '';
  let intakeMonths = [];
  let offerLetter = 'Free'; // default fallback

  $('.course-detail-key-info-title').each((i, el) => {
    const keyText = $(el).text().trim().toLowerCase();
    const valEl = $(el).closest('.row').find('.course-detail-key-info-desc');
    if (valEl.length > 0) {
      const valText = valEl.text().trim();
      if (keyText.includes('duration')) {
        duration = valText;
      } else if (keyText.includes('offer letter')) {
        offerLetter = valText;
      } else if (keyText.includes('intake')) {
        const monthsMap = {
          'jan': 'January',
          'feb': 'February',
          'mar': 'March',
          'apr': 'April',
          'may': 'May',
          'jun': 'June',
          'jul': 'July',
          'aug': 'August',
          'sep': 'September',
          'oct': 'October',
          'nov': 'November',
          'dec': 'December'
        };
        const lowerVal = valText.toLowerCase();
        for (const [short, full] of Object.entries(monthsMap)) {
          if (lowerVal.includes(short)) {
            intakeMonths.push(full);
          }
        }
      }
    }
  });

  return {
    englishRequirement: Object.keys(englishRequirement).length > 0 ? englishRequirement : null,
    tuitionFee,
    yearlyFees: yearlyFees.length > 0 ? yearlyFees : null,
    otherFees: otherFees.length > 0 ? otherFees : null,
    overview: overview || null,
    entryRequirementsText: entryRequirementsText || null,
    careerOutcomes: careerOutcomes.length > 0 ? careerOutcomes : null,
    curriculum,
    duration,
    intakeMonths,
    offerLetter,
  };
}

async function main() {
  const isTest = process.argv.includes('--test');
  console.log(`Running in ${isTest ? 'TEST' : 'FULL'} mode...`);

  // Connect to DB
  console.log('Connecting to database...');
  const client = await pool.connect();
  
  try {
    // Run migrations
    console.log('Checking database schema and adding missing columns...');
    await client.query(`
      ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS yearly_fees jsonb;
      ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS other_fees jsonb;
      ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS hero_image text;
      ALTER TABLE public.courses ALTER COLUMN tuition_fee DROP NOT NULL;
    `);
    console.log('Database schema is up to date.');

    // Load universities.json
    const universitiesJsonPath = join(__dirname, '../scraped-data/universities.json');
    if (!fs.existsSync(universitiesJsonPath)) {
      throw new Error(`File not found: ${universitiesJsonPath}`);
    }
    const universitiesJson = JSON.parse(fs.readFileSync(universitiesJsonPath, 'utf8'));
    console.log(`Loaded ${universitiesJson.length} universities from JSON file.`);

    // Fetch existing data from DB
    const dbUnisRes = await client.query('SELECT id, name, city FROM public.universities');
    const dbCoursesRes = await client.query('SELECT id, title, university_id, overview FROM public.courses');
    
    console.log(`DB has ${dbUnisRes.rows.length} universities and ${dbCoursesRes.rows.length} courses.`);

    // Map DB universities by name (lowercased)
    const dbUniByName = {};
    dbUnisRes.rows.forEach(row => {
      dbUniByName[row.name.toLowerCase().trim()] = row;
    });

    // Map DB courses by university_id and title (lowercased)
    const dbCourseMap = {};
    dbCoursesRes.rows.forEach(row => {
      const key = `${row.university_id}_${row.title.toLowerCase().trim()}`;
      dbCourseMap[key] = row;
    });

    // Scrape university list to get cities
    const cityMap = await scrapeUniversityList();

    // Prepare list of universities and courses to scrape
    const universitiesToProcess = [];
    const coursesToProcess = [];

    const force = process.argv.includes('--force');

    for (const uniJson of universitiesJson) {
      const dbUni = dbUniByName[uniJson.name.toLowerCase().trim()];
      if (!dbUni) {
        console.log(`Warning: University "${uniJson.name}" not found in database. Skipping.`);
        continue;
      }

      // Check if we should process this university
      const city = cityMap[uniJson.slug] || uniJson.city || dbUni.city;
      
      universitiesToProcess.push({
        id: dbUni.id,
        name: dbUni.name,
        slug: uniJson.slug,
        city: city,
      });

      // Prepare courses
      if (uniJson.courses && Array.isArray(uniJson.courses)) {
        for (const courseJson of uniJson.courses) {
          const key = `${dbUni.id}_${courseJson.title.toLowerCase().trim()}`;
          const dbCourse = dbCourseMap[key];
          if (!dbCourse) {
            continue; // Course not in DB, skip
          }
          
          if (dbCourse.overview && !force) {
            continue; // Already scraped, skip
          }
          
          coursesToProcess.push({
            id: dbCourse.id,
            title: dbCourse.title,
            slug: courseJson.slug,
            uniSlug: uniJson.slug,
            uniId: dbUni.id,
            fallbackTuitionMyr: courseJson.tuition_myr,
          });
        }
      }
    }

    if (isTest) {
      console.log('\n--- Running TEST Mode ---');
      const mmuUni = universitiesToProcess.find(u => u.slug === 'mmu-university');
      const tarUmtPhd = coursesToProcess.find(c => c.uniSlug.includes('tar-umt') && c.slug.includes('doctor-of-philosophy-in-computer-science'));
      const mmuAccounting = coursesToProcess.find(c => c.uniSlug === 'mmu-university' && c.slug === 'bachelor-of-accounting-hons');

      if (mmuUni) {
        console.log(`\nTesting University Scraping for: ${mmuUni.name}`);
        const uniData = await scrapeUniversityPage(mmuUni.slug, mmuUni.name);
        if (uniData) {
          console.log('Successfully scraped university data:');
          console.log('- Description (first 150 chars):', uniData.description?.substring(0, 150));
          console.log('- About Text (first 150 chars):', uniData.aboutText?.substring(0, 150));
          console.log('- Hero Image:', uniData.heroImage);
          console.log('- FAQs Count:', uniData.faqs?.length || 0);
          
          // Update DB
          await client.query(
            `UPDATE public.universities 
             SET description = $1, about_text = $2, faqs = $3, hero_image = $4, city = $5, updated_at = NOW() 
             WHERE id = $6`,
            [uniData.description, uniData.aboutText, uniData.faqs ? JSON.stringify(uniData.faqs) : null, uniData.heroImage, mmuUni.city, mmuUni.id]
          );
          console.log(`[DB SUCCESS] Updated university: ${mmuUni.name}`);
        } else {
          console.log('Failed to scrape university data.');
        }
      }

      if (tarUmtPhd) {
        console.log(`\nTesting Course Scraping for: ${tarUmtPhd.title}`);
        const courseData = await scrapeCoursePage(tarUmtPhd.uniSlug, tarUmtPhd.slug, tarUmtPhd.title);
        if (courseData) {
          console.log('Successfully scraped course data:');
          console.log('- English Requirements:', JSON.stringify(courseData.englishRequirement));
          console.log('- Tuition Fee (1st Year):', courseData.tuitionFee);
          console.log('- Yearly Fees Count:', courseData.yearlyFees?.length || 0);
          console.log('- Other Fees Count:', courseData.otherFees?.length || 0);
          console.log('- Overview (first 150 chars):', courseData.overview?.substring(0, 150));
          console.log('- Entry Requirements Text (first 150 chars):', courseData.entryRequirementsText?.substring(0, 150));
          console.log('- Career Outcomes:', JSON.stringify(courseData.careerOutcomes));
          console.log('- Curriculum Count:', courseData.curriculum?.length || 0);

          // Update DB
          await client.query(
            `UPDATE public.courses 
             SET entry_requirements = $1, tuition_fee = $2, yearly_fees = $3, other_fees = $4, overview = $5, entry_requirements_text = $6, career_outcomes = $7, curriculum = $8, offer_letter = $9, updated_at = NOW() 
             WHERE id = $10`,
            [
              courseData.englishRequirement ? JSON.stringify(courseData.englishRequirement) : null,
              courseData.tuitionFee || tarUmtPhd.fallbackTuitionMyr || null,
              courseData.yearlyFees ? JSON.stringify(courseData.yearlyFees) : null,
              courseData.otherFees ? JSON.stringify(courseData.otherFees) : null,
              courseData.overview,
              courseData.entryRequirementsText,
              courseData.careerOutcomes ? JSON.stringify(courseData.careerOutcomes) : null,
              courseData.curriculum ? JSON.stringify(courseData.curriculum) : null,
              courseData.offerLetter || 'Free',
              tarUmtPhd.id
            ]
          );
          console.log(`[DB SUCCESS] Updated course: ${tarUmtPhd.title}`);
        } else {
          console.log('Failed to scrape course data.');
        }
      }

      if (mmuAccounting) {
        console.log(`\nTesting Course Scraping for: ${mmuAccounting.title}`);
        const courseData = await scrapeCoursePage(mmuAccounting.uniSlug, mmuAccounting.slug, mmuAccounting.title);
        if (courseData) {
          console.log('Successfully scraped course data:');
          console.log('- English Requirements:', JSON.stringify(courseData.englishRequirement));
          console.log('- Tuition Fee (1st Year):', courseData.tuitionFee);
          console.log('- Yearly Fees Count:', courseData.yearlyFees?.length || 0);
          console.log('- Other Fees Count:', courseData.otherFees?.length || 0);
          console.log('- Overview (first 150 chars):', courseData.overview?.substring(0, 150));
          console.log('- Entry Requirements Text (first 150 chars):', courseData.entryRequirementsText?.substring(0, 150));
          console.log('- Career Outcomes:', JSON.stringify(courseData.careerOutcomes));
          console.log('- Curriculum Count:', courseData.curriculum?.length || 0);
          if (courseData.curriculum) {
            console.log('- Curriculum Year 1 Modules:', JSON.stringify(courseData.curriculum[0]));
          }

          // Update DB
          await client.query(
            `UPDATE public.courses 
             SET entry_requirements = $1, tuition_fee = $2, yearly_fees = $3, other_fees = $4, overview = $5, entry_requirements_text = $6, career_outcomes = $7, curriculum = $8, duration = $9, intake_months = $10, offer_letter = $11, updated_at = NOW() 
             WHERE id = $12`,
            [
              courseData.englishRequirement ? JSON.stringify(courseData.englishRequirement) : null,
              courseData.tuitionFee || null,
              courseData.yearlyFees ? JSON.stringify(courseData.yearlyFees) : null,
              courseData.otherFees ? JSON.stringify(courseData.otherFees) : null,
              courseData.overview,
              courseData.entryRequirementsText,
              courseData.careerOutcomes ? JSON.stringify(courseData.careerOutcomes) : null,
              courseData.curriculum ? JSON.stringify(courseData.curriculum) : null,
              courseData.duration || null,
              courseData.intakeMonths ? JSON.stringify(courseData.intakeMonths) : null,
              courseData.offerLetter || 'Free',
              mmuAccounting.id
            ]
          );
          console.log(`[DB SUCCESS] Updated course: ${mmuAccounting.title}`);
        } else {
          console.log('Failed to scrape course data.');
        }
      }
      
      console.log('\nTEST Mode completed.');
      return;
    }

    // --- FULL MODE ---
    console.log(`\nStarting Full Scraping for ${universitiesToProcess.length} universities and ${coursesToProcess.length} courses...`);

    // 1. Process Universities
    console.log('\n--- Processing Universities ---');
    for (let i = 0; i < universitiesToProcess.length; i++) {
      const uni = universitiesToProcess[i];
      console.log(`[${i + 1}/${universitiesToProcess.length}] Processing ${uni.name}...`);
      try {
        const uniData = await scrapeUniversityPage(uni.slug, uni.name);
        if (uniData) {
          await client.query(
            `UPDATE public.universities 
             SET description = $1, about_text = $2, faqs = $3, hero_image = $4, city = $5, updated_at = NOW() 
             WHERE id = $6`,
            [uniData.description, uniData.aboutText, uniData.faqs ? JSON.stringify(uniData.faqs) : null, uniData.heroImage, uni.city, uni.id]
          );
        } else {
          // Just update the city if we couldn't fetch the page
          await client.query(
            `UPDATE public.universities SET city = $1, updated_at = NOW() WHERE id = $2`,
            [uni.city, uni.id]
          );
        }
        await sleep(200); // polite delay
      } catch (err) {
        console.error(`Error processing university ${uni.name}: ${err.message}`);
      }
    }

    // 2. Process Courses (using p-limit for concurrency)
    console.log('\n--- Processing Courses ---');
    const limit = pLimit(10);
    let completedCourses = 0;
    
    const coursePromises = coursesToProcess.map(course => {
      return limit(async () => {
        try {
          const courseData = await scrapeCoursePage(course.uniSlug, course.slug, course.title);
          if (courseData) {
            await client.query(
              `UPDATE public.courses 
               SET entry_requirements = $1, tuition_fee = $2, yearly_fees = $3, other_fees = $4, overview = $5, entry_requirements_text = $6, career_outcomes = $7, curriculum = $8, duration = $9, intake_months = $10, offer_letter = $11, updated_at = NOW() 
               WHERE id = $12`,
              [
                courseData.englishRequirement ? JSON.stringify(courseData.englishRequirement) : null,
                courseData.tuitionFee || null,
                courseData.yearlyFees ? JSON.stringify(courseData.yearlyFees) : null,
                courseData.otherFees ? JSON.stringify(courseData.otherFees) : null,
                courseData.overview,
                courseData.entryRequirementsText,
                courseData.careerOutcomes ? JSON.stringify(courseData.careerOutcomes) : null,
                courseData.curriculum ? JSON.stringify(courseData.curriculum) : null,
                courseData.duration || null,
                courseData.intakeMonths ? JSON.stringify(courseData.intakeMonths) : null,
                courseData.offerLetter || 'Free',
                course.id
              ]
            );
          }
        } catch (err) {
          console.error(`Error processing course ${course.title}: ${err.message}`);
        } finally {
          completedCourses++;
          if (completedCourses % 20 === 0 || completedCourses === coursesToProcess.length) {
            console.log(`Progress: ${completedCourses}/${coursesToProcess.length} courses processed.`);
          }
          await sleep(100); // polite delay
        }
      });
    });

    await Promise.all(coursePromises);
    console.log('\nFULL Mode completed successfully!');

  } finally {
    client.release();
    await pool.end();
    console.log('Database connection closed.');
  }
}

main().catch(err => {
  console.error('Fatal error during execution:', err);
  pool.end();
});
