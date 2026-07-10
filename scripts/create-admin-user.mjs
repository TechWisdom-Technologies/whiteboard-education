import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/whiteboard_edu',
});

// Pre-hashed bcrypt hash of "test@admin"
// Generated using standard bcrypt rounds = 10
const ENCRYPTED_PASSWORD = '$2a$10$gOM.WlUa4Y25rUa9LwT6/.d4p9Gqj5wKx5kGjO82V5iS7n3yW5OaG';
const EMAIL = 'testadmin@gamil.com';

async function main() {
  const client = await pool.connect();
  console.log('Connected to database to create admin user...');
  try {
    await client.query('BEGIN');

    // 1. Check if user already exists in auth.users
    const userRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [EMAIL]);
    let userId;

    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].id;
      console.log(`User already exists with ID: ${userId}. Updating password...`);
      await client.query(
        'UPDATE auth.users SET encrypted_password = $1, updated_at = NOW() WHERE id = $2',
        [ENCRYPTED_PASSWORD, userId]
      );
    } else {
      console.log('Inserting new user into auth.users...');
      const insertUserRes = await client.query(
        `INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())
         RETURNING id`,
        [EMAIL, ENCRYPTED_PASSWORD, JSON.stringify({ display_name: 'Admin User' })]
      );
      userId = insertUserRes.rows[0].id;
      console.log(`Inserted user with ID: ${userId}`);
    }

    // 2. Insert profile if it doesn't exist (handle_new_user trigger might handle this, but let's be safe)
    const profileRes = await client.query('SELECT id FROM public.profiles WHERE user_id = $1', [userId]);
    if (profileRes.rows.length === 0) {
      console.log('Inserting profile in public.profiles...');
      await client.query(
        'INSERT INTO public.profiles (user_id, email, display_name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [userId, EMAIL, 'Admin User']
      );
    } else {
      console.log('Profile already exists.');
    }

    // 3. Ensure role exists in public.user_roles
    const roleRes = await client.query('SELECT id FROM public.user_roles WHERE user_id = $1 AND role = \'admin\'', [userId]);
    if (roleRes.rows.length === 0) {
      console.log('Adding "admin" role to public.user_roles...');
      await client.query(
        'INSERT INTO public.user_roles (user_id, role, created_at) VALUES ($1, \'admin\'::public.app_role, NOW())',
        [userId]
      );
    } else {
      console.log('Admin role already exists.');
    }

    await client.query('COMMIT');
    console.log(`\nSuccess! Admin user created/updated successfully.`);
    console.log(`Email: ${EMAIL}`);
    console.log(`Password: test@admin`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to create admin user:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
