// lib/db.js
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use environment variable or fallback to a placeholder in development
const connectionString = process.env.DATABASE_URL || 'postgres://placeholder:placeholder@placeholder/placeholder';

// Configuration with SSL for production
const client = postgres(connectionString, { 
  ssl: process.env.NODE_ENV === 'production',
  max: 1 
});

export const db = drizzle(client, { schema });