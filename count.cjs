const fs = require('fs');
const lines = fs.readFileSync('src/pages/Courses.tsx', 'utf8').split('\n');
let depth = 0;
for(let i=360; i<560; i++) {
  const l = lines[i];
  if (l == null) continue;
  const open = (l.match(/<div/g)||[]).length;
  const close = (l.match(/<\/div>/g)||[]).length;
  depth += open - close;
  if (open || close || depth === 0) {
    console.log(`${i+1}: D=${depth} | O=${open} C=${close} | ${l.trim()}`);
  }
}
