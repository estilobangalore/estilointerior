require('dotenv').config();
const { Pool } = require('pg');

async function setupNeonDB() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    console.log('Please set up your database connection by either:');
    console.log('1. Creating a .env file with DATABASE_URL=postgresql://...');
    console.log('2. Or running `export DATABASE_URL=postgresql://...`');
    process.exit(1);
  }

  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test the connection
    const client = await pool.connect();
    console.log('Successfully connected to Neon database');
    client.release();

    // Additional setup steps can go here
    
    await pool.end();
  } catch (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
}

setupNeonDB(); 