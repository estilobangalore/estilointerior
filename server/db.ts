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

const client = postgres(connectionString, { max: 1 });

// Create the database client
export const db = drizzle(client, { schema }); 