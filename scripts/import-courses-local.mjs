import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

// Helper to split SQL file by statement safely
function splitSql(sqlText) {
  // Simple regex-based splitter for INSERT statements
  return sqlText
    .split(/;\s*$/m)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
}

async function runSqlFile(filePath, client) {
  console.log(`Reading SQL file: ${path.basename(filePath)}...`);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Since these files are large, we split by line or execute as a single block.
  // pg client.query can execute multiple queries separated by semicolons in a single call!
  console.log(`Executing statements in ${path.basename(filePath)}...`);
  await client.query(sql);
  console.log(`✅ Completed: ${path.basename(filePath)}`);
}

async function main() {
  let client;
  try {
    console.log('Connecting to Local PostgreSQL Database...');
    client = await pool.connect();
    
    // Clear old dependent data just in case
    console.log('Clearing old courses and accommodations...');
    await client.query('DELETE FROM public.accommodations');
    await client.query('DELETE FROM public.courses');
    
    // List of files to import
    const sqlFiles = [
      path.join(__dirname, 'import-all-courses-part1.sql'),
      path.join(__dirname, 'import-all-courses-part2.sql'),
      path.join(__dirname, 'import-all-courses-part3.sql'),
      path.join(__dirname, 'import-all-courses-part4.sql'),
      path.join(__dirname, 'import-all-accommodations.sql'),
    ];
    
    for (const file of sqlFiles) {
      if (fs.existsSync(file)) {
        await runSqlFile(file, client);
      } else {
        console.warn(`⚠️ File not found: ${file}`);
      }
    }
    
    console.log('\n🎉 All courses and accommodations imported and linked successfully!');
  } catch (err) {
    console.error('❌ Error during import:', err);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main();
