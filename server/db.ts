import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

// Check for environment variable
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Please set it to use the database.');
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn('⚠️ WARNING: DATABASE_URL not set. Database operations will fail if invoked, but startup will continue.');
}

// Always enable SSL for Neon PostgreSQL, especially on Vercel
const ssl = { 
  ssl: { 
    rejectUnauthorized: false 
  } 
};

console.log(`SSL mode: enabled (required for Neon DB)`);

// Create the Postgres client with optimized settings for serverless environment
const client = postgres(connectionString || 'postgresql://localhost:5432/dummy', { 
  max: 1, // Use a single connection for serverless
  connect_timeout: 10, // Timeout after 10 seconds
  idle_timeout: 20,    // Connection idle timeout
  ...ssl
});

// Create the database client
export const db = drizzle(client, { schema }); 
