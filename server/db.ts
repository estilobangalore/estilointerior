import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Check for environment variable
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Please set it to use the database.');
}

// Create a connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fAOSpmk9xg8W@ep-floral-band-a4cmx9lc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
console.log('Connecting to database with connection string:', connectionString.replace(/:[^:]*@/, ':***@'));

// Always enable SSL for Neon PostgreSQL, especially on Vercel
const ssl = { 
  ssl: { 
    rejectUnauthorized: false 
  } 
};

console.log(`SSL mode: enabled (required for Neon DB)`);

// Create the Postgres client with optimized settings for serverless environment
const client = postgres(connectionString, { 
  max: 1, // Use a single connection for serverless
  connect_timeout: 10, // Timeout after 10 seconds
  idle_timeout: 20,    // Connection idle timeout
  ...ssl
});

// Create the database client
export const db = drizzle(client, { schema }); 
