import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Check for environment variable
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Please set it to use the database.');
}

// Create a connection
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/beautifulinteriors';
console.log('Connecting to database with connection string:', connectionString.replace(/:[^:]*@/, ':***@'));

// Add SSL configuration for production
const ssl = process.env.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: false } } : {};

const client = postgres(connectionString, { 
  max: 1,
  ...ssl
});

// Create the database client
export const db = drizzle(client, { schema }); 
