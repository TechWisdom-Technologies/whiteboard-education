/**
 * Split import-courses.sql into smaller files for Supabase SQL Editor
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const input = readFileSync(join(__dirname, 'import-courses.sql'), 'utf8');

const MAX_SIZE = 150 * 1024; // 150KB per file

// Split by INSERT statements or Comments
const chunks = input.split(/(?=\nINSERT INTO public.courses|\n-- [A-Z])/);
const header = chunks.shift();

let fileNum = 1;
let current = '';
let currentSize = 0;

function flush() {
  if (!current.trim()) return;
  const path = join(__dirname, `import-courses-part${fileNum}.sql`);
  const content = fileNum === 1
    ? `-- Part ${fileNum}\n${header}\n${current}`
    : `-- Part ${fileNum} (continue)\n${current}`;
  writeFileSync(path, content, 'utf8');
  console.log(`  Part ${fileNum}: ${(Buffer.byteLength(content) / 1024).toFixed(0)} KB`);
  fileNum++;
  current = '';
  currentSize = 0;
}

for (const chunk of chunks) {
  const chunkSize = Buffer.byteLength(chunk);
  if (currentSize + chunkSize > MAX_SIZE && current) {
    flush();
  }
  current += chunk;
  currentSize += chunkSize;
}
flush();

console.log(`\nSplit into ${fileNum - 1} files. Run them in order (Part 1 first).`);
