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
  console.log('Initializing database connection...');
  console.log('Connection string format check:');
  if (connectionString) {
    console.log('- Starts with postgres:// or postgresql://', 
      connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'));
    console.log('- Contains @ symbol:', connectionString.includes('@'));
    console.log('- URL length:', connectionString.length);
  } else {
    console.log('- No connection string provided');
  }
  
  client = postgres(connectionString || '', { 
    ssl: { require: true, rejectUnauthorized: false },
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
    debug: true
  });
  console.log("Database client initialized");
} catch (error) {
  console.error("Failed to initialize database client:", error.message);
  console.error("Error stack:", error.stack);
  // Create a dummy client that will throw errors when used
  client = {
    async *[Symbol.asyncIterator]() {
      throw new Error("Database client not properly initialized");
    }
  };
}

// Create and export the database connection
export const db = drizzle(client, { schema });

// Add a test function to check connection
export async function testConnection() {
  try {
    const result = await db.execute('SELECT 1 as test');
    console.log('Database connection test successful:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error: error.message };
  }
}
