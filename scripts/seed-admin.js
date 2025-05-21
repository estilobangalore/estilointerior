/**
 * Admin User Seed Script
 * This script adds an admin user to the database
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

console.log('👤 Admin User Seed Script');
console.log('========================\n');

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

// Simple password hashing function (use more secure methods in production)
function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

// Add admin user
async function addAdminUser() {
  try {
    // Default admin credentials
    const username = 'admin';
    const password = 'admin123'; // You should change this in production
    const hashedPassword = hashPassword(password);
    
    // Check if user already exists
    const checkResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (checkResult.rows.length > 0) {
      console.log('ℹ️ Admin user already exists.');
      return;
    }
    
    // Insert admin user
    const result = await pool.query(
      'INSERT INTO users (username, password, is_admin) VALUES ($1, $2, $3) RETURNING id',
      [username, hashedPassword, true]
    );
    
    console.log(`✅ Admin user created with ID: ${result.rows[0].id}`);
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n⚠️ IMPORTANT: Change this password after first login in production!\n');
  } catch (error) {
    console.error('❌ Error adding admin user:', error.message);
  }
}

// Sample data functions
async function addSamplePortfolioItems() {
  try {
    const portfolioItems = [
      {
        title: 'Modern Living Room',
        description: 'A contemporary living room design with minimalist furniture and neutral color palette.',
        imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92',
        category: 'Living Room',
        featured: true
      },
      {
        title: 'Elegant Kitchen',
        description: 'A spacious kitchen with marble countertops and high-end appliances.',
        imageUrl: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7',
        category: 'Kitchen',
        featured: true
      },
      {
        title: 'Cozy Bedroom',
        description: 'A warm and inviting bedroom with soft textures and ambient lighting.',
        imageUrl: 'https://images.unsplash.com/photo-1617325247661-675ab4b64b72',
        category: 'Bedroom',
        featured: false
      }
    ];
    
    for (const item of portfolioItems) {
      await pool.query(
        'INSERT INTO portfolio_items (title, description, image_url, category, featured) VALUES ($1, $2, $3, $4, $5)',
        [item.title, item.description, item.imageUrl, item.category, item.featured]
      );
    }
    
    console.log(`✅ Added ${portfolioItems.length} sample portfolio items`);
  } catch (error) {
    console.error('❌ Error adding sample portfolio items:', error.message);
  }
}

async function addSampleTestimonials() {
  try {
    const testimonials = [
      {
        name: 'Sarah Johnson',
        role: 'Homeowner',
        content: 'Working with this interior design team was a dream. They transformed our living space beyond our expectations.',
        imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg'
      },
      {
        name: 'Michael Chen',
        role: 'Business Owner',
        content: 'The office redesign has completely changed our workspace. Our employees love the new environment!',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        name: 'Emily Rodriguez',
        role: 'Apartment Owner',
        content: 'Despite my limited budget, they created a beautiful design that made my small apartment feel spacious and elegant.',
        imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    ];
    
    for (const item of testimonials) {
      await pool.query(
        'INSERT INTO testimonials (name, role, content, image_url) VALUES ($1, $2, $3, $4)',
        [item.name, item.role, item.content, item.imageUrl]
      );
    }
    
    console.log(`✅ Added ${testimonials.length} sample testimonials`);
  } catch (error) {
    console.error('❌ Error adding sample testimonials:', error.message);
  }
}

// Execute all data seeding functions
async function seedDatabase() {
  try {
    await addAdminUser();
    await addSamplePortfolioItems();
    await addSampleTestimonials();
    console.log('\n🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
  } finally {
    // Only close the pool once at the end of all operations
    await pool.end();
  }
}

seedDatabase(); 