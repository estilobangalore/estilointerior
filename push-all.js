/**
 * Database Schema Push Script
 * This script pushes the schema to the Neon database without interactive prompts
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Preparing to push schema to database...');

// Check if the DATABASE_URL environment variable is set
if (!process.env.DATABASE_URL) {
  // Try to load from .env file
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=(.+?)(\n|$)/);
      if (dbUrlMatch && dbUrlMatch[1]) {
        process.env.DATABASE_URL = dbUrlMatch[1];
        console.log('✅ Loaded DATABASE_URL from .env file');
      }
    }
  } catch (error) {
    console.error('❌ Error loading .env file:', error.message);
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set.');
  console.error('Please set it before running this script.');
  process.exit(1);
}

// Test database connection first
console.log('🔄 Testing database connection...');
try {
  // Setup DB connection
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Test the connection
  pool.query('SELECT NOW() as now')
    .then(result => {
      console.log(`✅ Successfully connected to database (${result.rows[0].now})`);
      
      // After successful connection, run the migration
      console.log('🔄 Pushing schema to database...');
      try {
        // Run drizzle-kit push command (no flags)
        execSync('npx drizzle-kit push', { 
          stdio: 'inherit',
          env: {
            ...process.env,
            DRIZZLE_YES: 'true', // Try to auto-confirm prompts
          }
        });
        console.log('✅ Schema successfully pushed to database');
        
        console.log('\n🎉 Database setup complete!');
        console.log('You can now run the application with:');
        console.log('  npm run dev');
      } catch (error) {
        console.error('❌ Failed to push schema:', error.message);
        process.exit(1);
      } finally {
        pool.end();
      }
    })
    .catch(error => {
      console.error('❌ Failed to connect to database:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.error('❌ Failed to set up database connection:', error.message);
  process.exit(1);
} 