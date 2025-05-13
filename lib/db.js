import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Database functionality will not work correctly.");
}

// Configuration with SSL for Neon
let client;
try {
  client = postgres(connectionString || '', { 
    ssl: { require: true, rejectUnauthorized: false },
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });
  console.log("Database client initialized");
} catch (error) {
  console.error("Failed to initialize database client:", error.message);
  // Create a dummy client that will throw errors when used
  client = {
    async *[Symbol.asyncIterator]() {
      throw new Error("Database client not properly initialized");
    }
  };
}

// Create and export the database connection
export const db = drizzle(client, { schema });
