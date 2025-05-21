/**
 * Database Inspector Script
 * This script examines the Neon database tables and their contents
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Database Inspector');
console.log('====================\n');

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

// Setup DB connection
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fAOSpmk9xg8W@ep-floral-band-a4cmx9lc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Get all tables
async function inspectDatabase() {
  try {
    // Get connection info
    const result = await pool.query('SELECT current_database(), current_user, version()');
    console.log(`📊 Connected to database: ${result.rows[0].current_database}`);
    console.log(`👤 Connected as user: ${result.rows[0].current_user}`);
    console.log(`🛢️  PostgreSQL version: ${result.rows[0].version.split(' ')[1]}\n`);

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in the database');
      return;
    }
    
    console.log(`📋 Found ${tablesResult.rows.length} tables in the database:`);
    
    // Inspect each table
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n📝 Table: ${tableName}`);
      
      // Get table structure
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log('  Structure:');
      columnsResult.rows.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
        console.log(`  - ${col.column_name} (${col.data_type}) ${nullable} ${defaultVal}`);
      });
      
      // Count rows in the table
      const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const rowCount = parseInt(countResult.rows[0].count);
      console.log(`  Row count: ${rowCount}`);
      
      // Show sample data if there are rows
      if (rowCount > 0) {
        const sampleResult = await pool.query(`SELECT * FROM "${tableName}" LIMIT 3`);
        console.log('  Sample data:');
        sampleResult.rows.forEach((row, i) => {
          console.log(`  [${i+1}] ${JSON.stringify(row)}`);
        });
        
        if (rowCount > 3) {
          console.log(`  ... and ${rowCount - 3} more rows`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error inspecting database:', error.message);
  } finally {
    pool.end();
  }
}

inspectDatabase(); 