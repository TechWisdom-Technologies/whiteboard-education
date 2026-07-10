import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu';
const PROD_DB_URL = process.env.PROD_DATABASE_URL;

if (!PROD_DB_URL) {
  console.error('❌ Error: PROD_DATABASE_URL environment variable is missing!');
  console.error('Please set it before running. E.g.:');
  console.error('  $env:PROD_DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0...pooler.supabase.com:5432/postgres"');
  console.error('  node scripts/sync-to-production.mjs');
  process.exit(1);
}

const localPool = new pg.Pool({ connectionString: LOCAL_DB_URL });
const prodPool = new pg.Pool({ connectionString: PROD_DB_URL });

const TABLES = [
  'countries',
  'universities',
  'courses',
  'accommodations',
  'scholarships',
  'language_centers',
  'blogs',
  'events'
];

async function syncTable(tableName, localClient, prodClient) {
  console.log(`\n⏳ Syncing table "${tableName}"...`);
  
  // 1. Fetch all rows from local database
  const localRowsResult = await localClient.query(`SELECT * FROM public.${tableName}`);
  const rows = localRowsResult.rows;
  console.log(`   Fetched ${rows.length} rows from local table.`);
  
  if (rows.length === 0) {
    console.log(`   No rows to sync for "${tableName}".`);
    return;
  }

  // 2. Fetch table column names from information_schema to ensure exact columns match
  const columnsResult = await prodClient.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = $1
  `, [tableName]);
  const prodColumns = columnsResult.rows.map(r => r.column_name);

  // We filter row keys to insert only columns that exist in the production database
  const sampleRow = rows[0];
  const columnsToInsert = Object.keys(sampleRow).filter(col => prodColumns.includes(col));
  
  if (columnsToInsert.length === 0) {
    console.log(`   No matching columns found between local and production table "${tableName}"!`);
    return;
  }

  console.log(`   Matching columns to insert/upsert: ${columnsToInsert.join(', ')}`);

  // 3. Prepare SQL query templates for bulk upsert
  const columnsList = columnsToInsert.join(', ');
  const placeholders = columnsToInsert.map((_, i) => `$${i + 1}`).join(', ');
  
  // ON CONFLICT (id) DO UPDATE SET col1 = EXCLUDED.col1, ...
  const updateSet = columnsToInsert
    .filter(col => col !== 'id' && col !== 'created_at')
    .map(col => `${col} = EXCLUDED.${col}`)
    .join(', ');

  let upsertSql = `
    INSERT INTO public.${tableName} (${columnsList}) 
    VALUES (${placeholders})
  `;
  
  if (updateSet) {
    upsertSql += ` ON CONFLICT (id) DO UPDATE SET ${updateSet}`;
  } else {
    upsertSql += ` ON CONFLICT (id) DO NOTHING`;
  }

  // 4. Run upserts on production client
  let successCount = 0;
  for (const row of rows) {
    const values = columnsToInsert.map(col => {
      let val = row[col];
      
      // Default null/undefined/NaN for specific columns to avoid NOT NULL constraint violations
      if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
        if (col === 'tuition_fee' || col === 'price_per_month' || col === 'spots_left') {
          val = 0;
        } else if (col === 'title' || col === 'name') {
          val = 'Unnamed';
        }
      }

      // Convert objects / arrays to JSON strings for jsonb compatibility
      if (val !== null && typeof val === 'object') {
        return JSON.stringify(val);
      }
      return val;
    });

    try {
      await prodClient.query(upsertSql, values);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Failed to sync row ID ${row.id || 'unknown'} in table "${tableName}":`, err.message);
    }
  }

  console.log(`   ✅ Successfully synced ${successCount}/${rows.length} rows to production.`);
}

async function main() {
  let localClient, prodClient;
  try {
    console.log('🔗 Connecting to Local Database...');
    localClient = await localPool.connect();
    
    console.log('🔗 Connecting to Remote Production Database...');
    prodClient = await prodPool.connect();

    console.log('\n🚀 Starting database sync in order of references...');
    
    // Disable RLS triggers/constraints temporarily on prodClient if needed or run standard upsert
    // Standard upsert will respect RLS if the role is service_role/admin (connection URIs usually connect as postgres superuser anyway)
    
    for (const tableName of TABLES) {
      await syncTable(tableName, localClient, prodClient);
    }

    console.log('\n🎉 Production Database Sync Completed Successfully!');
  } catch (err) {
    console.error('\n❌ Sync process crashed:', err);
    process.exit(1);
  } finally {
    if (localClient) localClient.release();
    if (prodClient) prodClient.release();
    await localPool.end();
    await prodPool.end();
  }
}

main();
