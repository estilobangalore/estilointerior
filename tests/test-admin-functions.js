/**
 * Admin Function & Form Submission Test Script
 * Tests portfolio item creation and consultation form submissions
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Admin Functions & Form Submissions');
console.log('==========================================\n');

// Load environment variables
if (!process.env.DATABASE_URL) {
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

// Test portfolio item creation (admin dashboard functionality)
async function testPortfolioCreation() {
  console.log('\n📸 Testing Portfolio Item Creation (Admin Dashboard)');
  
  try {
    // Create a test portfolio item (simulates admin dashboard action)
    const portfolioItem = {
      title: 'Modern Bathroom Design',
      description: 'Luxurious bathroom with freestanding tub, walk-in shower, and marble flooring.',
      imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14',
      category: 'Bathroom',
      featured: true
    };
    
    // Insert the test item
    const result = await pool.query(
      'INSERT INTO portfolio_items (title, description, image_url, category, featured) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [portfolioItem.title, portfolioItem.description, portfolioItem.imageUrl, portfolioItem.category, portfolioItem.featured]
    );
    
    console.log(`✅ Portfolio item created with ID: ${result.rows[0].id}`);
    
    // Verify the item was added
    const verifyResult = await pool.query('SELECT * FROM portfolio_items WHERE id = $1', [result.rows[0].id]);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Successfully verified portfolio item in database');
      console.log(`   Title: ${verifyResult.rows[0].title}`);
      console.log(`   Category: ${verifyResult.rows[0].category}`);
      console.log(`   Featured: ${verifyResult.rows[0].featured ? 'Yes' : 'No'}`);
    } else {
      console.error('❌ Failed to verify portfolio item in database');
    }
    
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Error testing portfolio creation:', error.message);
  }
}

// Test portfolio update (admin dashboard functionality)
async function testPortfolioUpdate(itemId) {
  console.log('\n🔄 Testing Portfolio Item Update (Admin Dashboard)');
  
  try {
    if (!itemId) {
      console.log('⚠️ No portfolio item ID provided for update test');
      return;
    }
    
    // Update the featured status (simulates admin dashboard action)
    const updateResult = await pool.query(
      'UPDATE portfolio_items SET featured = $1 WHERE id = $2 RETURNING *',
      [false, itemId]
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ Successfully updated portfolio item ID: ${itemId}`);
      console.log(`   New featured status: ${updateResult.rows[0].featured ? 'Yes' : 'No'}`);
    } else {
      console.error(`❌ Failed to update portfolio item ID: ${itemId}`);
    }
  } catch (error) {
    console.error('❌ Error testing portfolio update:', error.message);
  }
}

// Test consultation form submission
async function testConsultationSubmission() {
  console.log('\n📝 Testing Consultation Form Submission');
  
  try {
    // Sample consultation form data (simulates user submission)
    const formData = {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      date: new Date('2025-07-15T10:00:00Z'),
      projectType: 'Kitchen Renovation',
      requirements: 'I would like to renovate my kitchen with modern appliances and a large island.',
      address: '123 Main Street, Anytown, CA 12345',
      budget: '$15,000 - $25,000',
      preferredContactTime: 'Afternoons',
      source: 'Google Search'
    };
    
    // Insert the consultation request
    const result = await pool.query(
      `INSERT INTO consultations 
       (name, email, phone, date, project_type, requirements, address, budget, preferred_contact_time, source) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        formData.name, 
        formData.email, 
        formData.phone, 
        formData.date, 
        formData.projectType, 
        formData.requirements,
        formData.address,
        formData.budget,
        formData.preferredContactTime,
        formData.source
      ]
    );
    
    console.log(`✅ Consultation request created with ID: ${result.rows[0].id}`);
    
    // Verify the consultation was added
    const verifyResult = await pool.query('SELECT * FROM consultations WHERE id = $1', [result.rows[0].id]);
    
    if (verifyResult.rows.length > 0) {
      console.log('✅ Successfully verified consultation in database');
      console.log(`   Name: ${verifyResult.rows[0].name}`);
      console.log(`   Project Type: ${verifyResult.rows[0].project_type}`);
      console.log(`   Status: ${verifyResult.rows[0].status}`);
      console.log(`   Created At: ${verifyResult.rows[0].created_at}`);
    } else {
      console.error('❌ Failed to verify consultation in database');
    }
    
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Error testing consultation submission:', error.message);
  }
}

// Test consultation status update (admin dashboard functionality)
async function testConsultationStatusUpdate(consultationId) {
  console.log('\n🔄 Testing Consultation Status Update (Admin Dashboard)');
  
  try {
    if (!consultationId) {
      console.log('⚠️ No consultation ID provided for status update test');
      return;
    }
    
    // Update the consultation status (simulates admin dashboard action)
    const updateResult = await pool.query(
      'UPDATE consultations SET status = $1, notes = $2 WHERE id = $3 RETURNING *',
      ['confirmed', 'Customer called and confirmed the appointment. Will need to prepare kitchen renovation plans.', consultationId]
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ Successfully updated consultation ID: ${consultationId}`);
      console.log(`   New status: ${updateResult.rows[0].status}`);
      console.log(`   Notes added: ${updateResult.rows[0].notes.substring(0, 30)}...`);
    } else {
      console.error(`❌ Failed to update consultation ID: ${consultationId}`);
    }
  } catch (error) {
    console.error('❌ Error testing consultation status update:', error.message);
  }
}

// Run all tests
async function runTests() {
  try {
    // Test portfolio creation and update
    const portfolioId = await testPortfolioCreation();
    await testPortfolioUpdate(portfolioId);
    
    // Test consultation submission and status update
    const consultationId = await testConsultationSubmission();
    await testConsultationStatusUpdate(consultationId);
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    await pool.end();
  }
}

runTests(); 