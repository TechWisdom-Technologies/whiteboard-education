import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

async function main() {
  const password = 'test@admin';
  
  // 1. Generate salt and hash
  console.log('Generating fresh bcrypt hash for: ' + password);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Fresh Hash:', hash);

  // 2. Double check validation locally
  const isValid = await bcrypt.compare(password, hash);
  console.log('Local Validation Check:', isValid ? 'SUCCESS' : 'FAILED');

  // 3. Update the database record with the fresh hash
  const client = await pool.connect();
  try {
    console.log('Updating DB record for testadmin@gamil.com with fresh hash...');
    const res = await client.query(
      `UPDATE auth.users 
       SET encrypted_password = $1, updated_at = NOW() 
       WHERE email = 'testadmin@gamil.com'
       RETURNING id`,
      [hash]
    );
    if (res.rows.length > 0) {
      console.log('Successfully updated user with ID:', res.rows[0].id);
    } else {
      console.log('User testadmin@gamil.com not found in auth.users!');
    }
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
