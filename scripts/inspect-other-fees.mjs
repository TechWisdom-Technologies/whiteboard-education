import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://en.your-uni.com/university/universiti-geomatika-malaysia/diploma-in-beautician-and-health';
  console.log('Fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== ALL TABLES ===');
  $('table').each((i, el) => {
    console.log(`\nTable ${i}:`);
    const rows = [];
    $(el).find('tr').each((rj, tr) => {
      const cells = [];
      $(tr).find('td, th').each((ck, td) => {
        cells.push($(td).text().trim().replace(/\s+/g, ' '));
      });
      rows.push(cells);
    });
    console.log(JSON.stringify(rows, null, 2));
  });

  console.log('\n=== OTHER POTENTIAL FEE CONTAINERS ===');
  // Check if they are not in a table, but in list items or divs
  $('.fee, [class*="fee"], [class*="price"]').each((i, el) => {
    console.log(`Class: "${$(el).attr('class') || ''}", Text: "${$(el).text().trim().replace(/\s+/g, ' ')}"`);
  });
}

main().catch(console.error);
