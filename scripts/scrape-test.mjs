import * as cheerio from 'cheerio';

async function test() {
  const url = "https://en.your-uni.com/university/mmu-university/bachelor-of-business-administration-hons-human-resource-management/";
  console.log("Fetching", url);
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const data = {};

  // Find key information (like English requirement, offer letter)
  // Usually this is in a grid or list under "Key Information"
  const keyInfoCards = $('.key-info-section, .key-info-box, .elementor-widget-container').text();
  
  // We can just dump everything and find it out in the terminal
  console.log("Found body text snippet:", $('body').text().replace(/\s+/g, ' ').substring(0, 1000));
}

test().catch(console.error);
