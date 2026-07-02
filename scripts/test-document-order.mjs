import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://en.your-uni.com/university/mmu-university/bachelor-of-accounting-hons';
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const allElements = $('*');
  let foundCurriculum = false;
  let curriculum = [];
  let currentYear = null;

  const stopWords = ['about', 'apply', 'inquiry', 'contact', 'comment', 'location', 'accommodation', 'other courses', 'similar', 'gallery', 'facilities', 'partner', 'review', 'news', 'event', 'register', 'faq', 'why'];

  allElements.each((i, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    
    if (!foundCurriculum) {
      if (/^h[1-3]$/.test(tagName) && text.toLowerCase() === 'curriculum') {
        foundCurriculum = true;
        console.log('Found Curriculum Header at element', i);
      }
      return;
    }

    // We are in the curriculum section
    // Stop if we hit a new major section (another h1 or h2)
    if (/^h[1-2]$/.test(tagName)) {
      console.log(`Stopping at next major header: <${tagName}> "${text}"`);
      foundCurriculum = false;
      return;
    }

    // Stop if we hit any header containing stop-words
    if (/^h[1-6]$/.test(tagName)) {
      const lowerText = text.toLowerCase();
      if (stopWords.some(word => lowerText.includes(word))) {
        console.log(`Stopping at header with stop-word: <${tagName}> "${text}"`);
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
        console.log(`Created section: "${text}"`);
      }
    }

    // Capture modules
    if (currentYear) {
      // If it's a list item
      if (tagName === 'li') {
        const mod = text.replace(/^[•\s\-\*]+/, '').trim().replace(/\s+/g, ' ');
        if (mod && mod.length > 2 && mod.length < 150 && !mod.toLowerCase().includes('credit')) {
          currentYear.modules.push(mod);
        }
      }
      // If it's a table cell
      else if (tagName === 'td') {
        const mod = text.replace(/^[•\s\-\*]+/, '').trim().replace(/\s+/g, ' ');
        if (mod && mod.length > 2 && mod.length < 150 && !mod.toLowerCase().includes('credit') && !/year\s*\d/i.test(mod)) {
          currentYear.modules.push(mod);
        }
      }
      // If it's a paragraph containing modules separated by br
      else if (tagName === 'p') {
        const htmlContent = $(el).html() || '';
        if (htmlContent.includes('<br')) {
          const items = htmlContent.split(/<br\s*\/?>/gi);
          items.forEach(item => {
            const cleanItem = cheerio.load(item).text().replace(/^[•\s\-\*]+/g, '').trim().replace(/\s+/g, ' ');
            if (cleanItem && cleanItem.length > 2 && cleanItem.length < 150 && !cleanItem.toLowerCase().includes('credit')) {
              currentYear.modules.push(cleanItem);
            }
          });
        } else {
          const cleanItem = text.replace(/^[•\s\-\*]+/g, '').trim().replace(/\s+/g, ' ');
          if (cleanItem && cleanItem.length > 2 && cleanItem.length < 150 && !cleanItem.toLowerCase().includes('credit') && !/year\s*\d/i.test(cleanItem)) {
            currentYear.modules.push(cleanItem);
          }
        }
      }
    }
  });

  // Filter out empty years/sections
  curriculum = curriculum.filter(y => y.modules.length > 0);

  console.log('=== EXTRACTED CURRICULUM ===');
  console.log(JSON.stringify(curriculum, null, 2));
}

main().catch(console.error);
