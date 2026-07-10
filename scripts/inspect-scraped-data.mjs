import fs from 'fs';

const rawData = fs.readFileSync('d:/Coding/Fidbi/whiteboard-education/scraped-data/universities.json', 'utf8');
const universities = JSON.parse(rawData);

console.log('Number of universities in JSON:', universities.length);
if (universities.length > 0) {
  const uni = universities[0];
  console.log('University keys:', Object.keys(uni));
  console.log('University Name:', uni.name);
  console.log('University Slug:', uni.slug);
  console.log('Number of courses:', uni.courses ? uni.courses.length : 0);
  if (uni.courses && uni.courses.length > 0) {
    console.log('First course keys:', Object.keys(uni.courses[0]));
    console.log('First course sample:', JSON.stringify(uni.courses[0], null, 2));
  }
}
