/**
 * Database Inspector Script
 * This script examines the Neon database tables and their contents
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Database Inspector');
console.log('====================\n');

// Define schema
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: timestamp("date").notNull(),
  projectType: text("project_type").notNull(),
  requirements: text("requirements").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  address: text("address"),
  budget: text("budget"),
  preferredContactTime: text("preferred_contact_time"),
  source: text("source").default("website"),
  notes: text("notes"),
});

const schema = { users, testimonials, portfolioItems, consultations };

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

async function checkDatabase() {
  try {
    console.log('🔄 Checking database connection...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    const client = postgres(process.env.DATABASE_URL, {
      ssl: {
        rejectUnauthorized: false
      },
      max: 1
    });

    const db = drizzle(client, { schema });

    // Check consultations table
    console.log('🔍 Checking consultations table...');
    const consultations = await db.select().from(schema.consultations).limit(1);
    console.log(`✅ Consultations table exists. Found ${consultations.length} records.`);

    // Check portfolio items table
    console.log('🔍 Checking portfolio items table...');
    const portfolioItems = await db.select().from(schema.portfolioItems).limit(1);
    console.log(`✅ Portfolio items table exists. Found ${portfolioItems.length} records.`);

    // Check testimonials table
    console.log('🔍 Checking testimonials table...');
    const testimonials = await db.select().from(schema.testimonials).limit(1);
    console.log(`✅ Testimonials table exists. Found ${testimonials.length} records.`);

    // Print sample data if available
    if (consultations.length > 0) {
      console.log('\n📝 Latest consultation:', JSON.stringify(consultations[0], null, 2));
    }
    if (portfolioItems.length > 0) {
      console.log('\n🖼️ Latest portfolio item:', JSON.stringify(portfolioItems[0], null, 2));
    }
    if (testimonials.length > 0) {
      console.log('\n💬 Latest testimonial:', JSON.stringify(testimonials[0], null, 2));
    }

    console.log('\n✅ All database checks passed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase(); 