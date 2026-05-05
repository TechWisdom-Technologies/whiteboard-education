import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const input = readFileSync(join(__dirname, 'update-course-details.sql'), 'utf8');

// Split the file into individual UPDATE statements
// Our scraper generated them separated by newlines, ending in semicolons
const statements = input.split(/(?=UPDATE public\.courses SET)/g);

const header = statements.shift(); // The first chunk is the comments/header

// We'll put 400 statements per file. 
// 3700 courses / 400 = about 9-10 files, easily handled by Supabase SQL editor.
const STATEMENTS_PER_FILE = 400;

let fileNum = 1;

for (let i = 0; i < statements.length; i += STATEMENTS_PER_FILE) {
  const batch = statements.slice(i, i + STATEMENTS_PER_FILE);
  const path = join(__dirname, `update-course-details-part${fileNum}.sql`);
  
  const content = `-- Part ${fileNum} of Course Details Update\n` + batch.join('');
  
  writeFileSync(path, content, 'utf8');
  console.log(`Created part ${fileNum} (${batch.length} updates)`);
  fileNum++;
}

console.log(`\nSuccess! Split into ${fileNum - 1} smaller files.`);
console.log(`You can now copy and run these sequentially in the Supabase SQL Editor.`);
