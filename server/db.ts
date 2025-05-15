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

// SSL configuration for Neon PostgreSQL
// Always use SSL with Neon in production and enabled by default
const isNeonDb = connectionString.includes('.neon.tech');
const sslRequired = process.env.NODE_ENV === 'production' || isNeonDb;

const ssl = sslRequired 
  ? { 
      ssl: { 
        rejectUnauthorized: false 
      } 
    } 
  : {};

console.log(`SSL mode: ${sslRequired ? 'enabled' : 'disabled'}`);

const client = postgres(connectionString, { 
  max: 1,
  connect_timeout: 10, // Timeout after 10 seconds
  idle_timeout: 20,    // Connection idle timeout
  ...ssl
});

// Create the database client
export const db = drizzle(client, { schema }); 
