import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function test() {
  const url = "https://en.your-uni.com/university/mmu-university/bachelor-of-business-administration-hons-human-resource-management/";
  const response = await fetch(url);
  const html = await response.text();
  fs.writeFileSync('test-course.html', html);
  console.log("Saved to test-course.html");
}
test();
