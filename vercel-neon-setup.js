/**
 * Neon Database Connection Verifier for Vercel
 * 
 * This script verifies your Neon PostgreSQL connection and
 * provides information about your Vercel setup.
 * 
 * Run with: node vercel-neon-setup.js
 */

// Load environment variables
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

console.log('======================================');
console.log('Neon Database + Vercel Setup Checker');
console.log('======================================\n');

// Check if DATABASE_URL is set
console.log('Checking environment variables:');
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in your environment');
  console.log('\nPlease set your Neon database URL by:');
  console.log('1. Creating a .env file with DATABASE_URL=postgresql://...');
  console.log('2. Or running `export DATABASE_URL=postgresql://...`');
  console.log('3. Or setting it in your Vercel dashboard/CLI\n');
  process.exit(1);
} else {
  console.log('✅ DATABASE_URL is set');
  
  // Basic validation of the connection string format
  const url = process.env.DATABASE_URL;
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    console.error('❌ DATABASE_URL must start with postgresql:// or postgres://');
    process.exit(1);
  }
  
  if (!url.includes('@')) {
    console.error('❌ DATABASE_URL must contain credentials and host (missing @ symbol)');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL format appears valid');
}

// Try to connect to the database
console.log('\nTesting database connection...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test query
pool.query('SELECT NOW() as now')
  .then(res => {
    console.log('✅ Successfully connected to Neon PostgreSQL!');
    console.log(`✅ Database server time: ${res.rows[0].now}`);
    
    // Check if tables exist
    return pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
  })
  .then(res => {
    if (res.rows.length === 0) {
      console.log('⚠️  No tables found in the database');
      console.log('   You may need to run migrations to create your tables');
    } else {
      console.log(`✅ Found ${res.rows.length} tables in your database:`);
      res.rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.table_name}`);
      });
    }
    
    console.log('\nVercel deployment information:');
    console.log('✅ Your application will use the DATABASE_URL from Vercel environment variables');
    console.log('✅ Make sure you have set DATABASE_URL in your Vercel project settings');
    
    console.log('\nNext steps:');
    console.log('1. Run `npm run db:push` to update your database schema');
    console.log('2. Deploy your application to Vercel');
    console.log('3. Verify database connection in your deployed application');
    
    pool.end();
  })
  .catch(err => {
    console.error('❌ Failed to connect to database or run query:', err.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if your Neon database is running');
    console.log('2. Verify your connection string is correct');
    console.log('3. Ensure your IP is allowed in Neon\'s connection settings');
    console.log('4. Check SSL settings if you\'re having SSL-related errors');
    pool.end();
    process.exit(1);
  }); 