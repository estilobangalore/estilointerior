import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';

// Connection details
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL not set in server/db.js');
}

const ssl = { 
  ssl: { 
    rejectUnauthorized: false 
  } 
};

// Create the Postgres client with optimized settings for serverless
const client = postgres(connectionString || '', { 
  max: 1, 
  connect_timeout: 10, 
  idle_timeout: 20,    
  ...ssl
});

// Create and export the database client
export const db = drizzle(client, { schema }); 