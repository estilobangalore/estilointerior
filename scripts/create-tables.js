import pg from 'pg';
import 'dotenv/config';

console.log('🔄 Connecting to Neon Database to check and create missing tables...');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment or .env file.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    console.log('Creating site_settings table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ site_settings table is ready.');

    console.log('Creating otps table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        otp TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ otps table is ready.');

    console.log('🎉 All missing tables have been verified/created successfully.');
  } catch (error) {
    console.error('❌ Error checking/creating tables:', error.message);
  } finally {
    await pool.end();
  }
}

run();
