import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log("Fixing the SQL syntax error...");

// Read the massive file
const inputPath = join(__dirname, 'update-course-details.sql');
let input = readFileSync(inputPath, 'utf8');

// The error is because UUIDs need quotes: WHERE id = 1234-5678; -> WHERE id = '1234-5678';
// We use regex to find WHERE id = <uuid>; and wrap the uuid in single quotes
input = input.replace(/WHERE id = ([a-f0-9\-]+);/g, "WHERE id = '$1';");

// Save the fixed file
writeFileSync(inputPath, input, 'utf8');
console.log("SQL file fixed!");

// Now re-split it
const statements = input.split(/(?=UPDATE public\.courses SET)/g);
const header = statements.shift(); // The first chunk is the comments/header

const STATEMENTS_PER_FILE = 400;
let fileNum = 1;

for (let i = 0; i < statements.length; i += STATEMENTS_PER_FILE) {
  const batch = statements.slice(i, i + STATEMENTS_PER_FILE);
  const path = join(__dirname, `update-course-details-part${fileNum}.sql`);
  const content = `-- Part ${fileNum} of Course Details Update\n` + batch.join('');
  writeFileSync(path, content, 'utf8');
  console.log(`Created fixed part ${fileNum} (${batch.length} updates)`);
  fileNum++;
}

console.log(`\nSuccess! Fixed and split into ${fileNum - 1} smaller files.`);
