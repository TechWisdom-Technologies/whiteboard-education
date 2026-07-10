import * as cheerio from 'cheerio';

async function main() {
  const url = 'https://en.your-uni.com/language-center-list';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log(`Page Title: ${$('title').text()}`);
    console.log('All links:');
    $('a').each((i, el) => {
      console.log($(el).attr('href'), '|', $(el).text().trim());
    });
  } catch (e) {
    console.error(e);
  }
}
main();
