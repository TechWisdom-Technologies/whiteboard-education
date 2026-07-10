import fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('d:/Coding/Fidbi/whiteboard-education/Sample Inspects/Courses/tar-umt-phd-cs.html', 'utf8');
const $ = cheerio.load(html);

console.log('=== EXTRACTING COURSE DETAILS FOR TAR UMT PhD CS ===');

// 1. Title
const title = $('h1').first().text().replace(/\s+/g, ' ').trim();
console.log('Title:', title);

// 2. English Requirement
// Let's find the English Requirement under key info
let englishRequirement = '';
$('.course-detail-key-info-title').each((i, el) => {
  if ($(el).text().trim() === 'English Requirement') {
    englishRequirement = $(el).next('.course-detail-key-info-desc').text().trim();
  }
});
console.log('English Requirement:', englishRequirement);

// 3. Tuition Fee (International Students)
// Let's find the fee for International Students.
// Usually there is a table under "Course Fee for International Students"
let tuitionFee = null;
const feeSection = $('.course-fees-title').filter((i, el) => $(el).text().includes('International'));
if (feeSection.length > 0) {
  // Let's look at the table next to it or inside the same container
  const table = feeSection.closest('.course-fees-container, div').find('table');
  if (table.length > 0) {
    // Let's find the fee cell. Usually the first row of body or a specific cell
    // Let's print all rows to see
    table.find('tr').each((i, tr) => {
      const cells = $(tr).find('td, th').map((j, cell) => $(cell).text().trim().replace(/\s+/g, ' ')).get();
      console.log(`Row [${i}]:`, cells);
    });
    
    // Let's extract the actual fee.
    // In TAR UMT PhD CS, let's see what the rows are.
  }
}

// 4. Course Overview, Entry Requirements, and Future Careers
// The user says: "Course overview dropdown e 1st e ekta text description thake, then Entry Requiremnets and Future Careers/Career opportunities thake heading akare."
// Let's look at the content under the "Course Overview" section.
const overviewContainer = $('.course-details-section').first(); // The accordion container
console.log('\n=== OVERVIEW CONTAINER SECTIONS ===');

// Let's extract the clean Overview Description (before the first h3 "Entry Requirements")
let overviewDescription = '';
const overviewBody = $('.course-details-section').first();
if (overviewBody.length > 0) {
  // Let's get the HTML of the overview and parse it
  // We want the text/HTML *before* the first h3 (which is Entry Requirements)
  const tempDiv = $('<div>').html(overviewBody.html());
  
  // Let's find the h2 "Course Overview"
  const overviewH2 = tempDiv.find('h2:contains("Course Overview")');
  let descHtml = '';
  if (overviewH2.length > 0) {
    let nextNode = overviewH2.next();
    while (nextNode.length > 0 && nextNode[0].tagName !== 'h3') {
      // Remove any "see more" / "see less" buttons if they exist
      nextNode.find('.read-more-bar, .read-less-bar, button.btn-see-more, button.btn-see-less').remove();
      descHtml += $.html(nextNode);
      nextNode = nextNode.next();
    }
  }
  overviewDescription = cheerio.load(descHtml).text().trim().replace(/\s+/g, ' ');
  console.log('Parsed Overview Description:', overviewDescription.substring(0, 300) + '...');
}

// 5. Entry Requirements
let entryRequirementsText = '';
const entryReqHeader = $('h3:contains("Entry Requirements")');
if (entryReqHeader.length > 0) {
  let nextNode = entryReqHeader.next();
  let reqHtml = '';
  while (nextNode.length > 0 && nextNode[0].tagName !== 'h3' && nextNode[0].tagName !== 'h2') {
    reqHtml += $.html(nextNode);
    nextNode = nextNode.next();
  }
  entryRequirementsText = cheerio.load(reqHtml).text().trim().replace(/\s+/g, ' ');
  console.log('Parsed Entry Requirements:', entryRequirementsText.substring(0, 300) + '...');
}

// 6. Future Careers (Career Opportunities)
const careers = [];
const careerHeader = $('h3:contains("Future Careers"), h3:contains("Career Opportunities")');
if (careerHeader.length > 0) {
  const ul = careerHeader.next('ul');
  if (ul.length > 0) {
    ul.find('li').each((i, li) => {
      careers.push($(li).text().trim());
    });
  }
}
console.log('Parsed Future Careers:', careers);
