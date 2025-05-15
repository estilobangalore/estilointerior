/**
 * Admin Login Test Script
 * This script helps diagnose admin login issues by checking the stored credentials 
 * in the database and verifying password hashing.
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { createHash } from 'crypto';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Admin Login Diagnostic Tool');
console.log('===========================\n');

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
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Simple password hashing function (for testing)
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

// Test admin login
async function testAdminLogin() {
  try {
    // Default admin credentials
    const username = 'admin';
    const password = 'admin123';
    const hashedPassword = hashPassword(password);
    
    console.log('Testing admin login with:');
    console.log(`- Username: ${username}`);
    console.log(`- Password: ${password} (plain)`);
    console.log(`- Hashed: ${hashedPassword.substring(0, 10)}...${hashedPassword.substring(hashedPassword.length - 10)}`);
    
    // Check if admin user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      console.log('\n❌ Admin user does not exist in the database.');
      console.log('Run the seed-admin.js script to create an admin user.');
      return;
    }
    
    const adminUser = result.rows[0];
    console.log('\n✅ Found admin user in database:');
    console.log(`- ID: ${adminUser.id}`);
    console.log(`- Username: ${adminUser.username}`);
    console.log(`- Is Admin: ${adminUser.is_admin}`);
    console.log(`- Password in DB: ${adminUser.password.substring(0, 10)}...${adminUser.password.substring(adminUser.password.length - 10)}`);
    
    // Check if password matches
    const plainTextMatch = password === adminUser.password;
    const hashMatch = hashedPassword === adminUser.password;
    
    console.log('\nPassword verification:');
    console.log(`- Plain text match: ${plainTextMatch ? '✅ Yes' : '❌ No'}`);
    console.log(`- Hash match: ${hashMatch ? '✅ Yes' : '❌ No'}`);
    
    if (!plainTextMatch && !hashMatch) {
      console.log('\n❌ Password doesn\'t match either in plain text or hashed form.');
      console.log('This might be why admin login is failing.');
      
      // Suggest a fix
      console.log('\nTo fix this issue, you can update the password in the database:');
      console.log('Option 1: Set to plain text password (for development only):');
      console.log(`  UPDATE users SET password = '${password}' WHERE username = '${username}';`);
      console.log('Option 2: Set to hashed password (recommended):');
      console.log(`  UPDATE users SET password = '${hashedPassword}' WHERE username = '${username}';`);
    } else {
      console.log('\n✅ Password verification successful! The issue is likely elsewhere.');
      console.log('Check the client-side login code or API route handling.');
    }
    
    // Check if is_admin is TRUE
    if (!adminUser.is_admin) {
      console.log('\n❌ The admin user does not have admin privileges (is_admin is false).');
      console.log('To fix this issue, run:');
      console.log(`  UPDATE users SET is_admin = TRUE WHERE username = '${username}';`);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin login:', error.message);
  } finally {
    await pool.end();
  }
}

testAdminLogin(); 