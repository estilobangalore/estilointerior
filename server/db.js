import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/schema.js';

// Check for environment variable
if (!process.env.DATABASE_URL) {
  console.warn('[DB] DATABASE_URL not set. Using fallback connection string.');
}

// Create a connection
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fAOSpmk9xg8W@ep-floral-band-a4cmx9lc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';
console.log('[DB] Connecting to database with connection string:', connectionString.replace(/:[^:]*@/, ':***@'));

// Always enable SSL for Neon PostgreSQL, especially on Vercel
const ssl = { 
  ssl: { 
    rejectUnauthorized: false 
  } 
};

console.log(`[DB] SSL mode: enabled (required for Neon DB)`);

let db;

try {
  // Create the Postgres client with optimized settings for serverless environment
  const client = postgres(connectionString, { 
    max: 1, // Use a single connection for serverless
    connect_timeout: 10, // Timeout after 10 seconds
    idle_timeout: 20,    // Connection idle timeout
    connection: {
      statement_timeout: 30000, // 30s statement timeout
    },
    debug: process.env.NODE_ENV !== 'production', // Debug only in non-prod
    ...ssl
  });

  // Create the database client
  db = drizzle(client, { schema });
  console.log('[DB] Database connection initialized successfully');
} catch (error) {
  console.error('[DB] Failed to initialize database connection:', error);
  // Provide a fallback db object that logs errors but doesn't crash
  db = createFallbackDb(error);
}

function createFallbackDb(originalError) {
  console.log('[DB] Creating fallback database proxy');
  return new Proxy({}, {
    get: function(target, prop) {
      console.log(`[DB Fallback] Attempted to call: ${prop}()`);
      
      // If the property is a common method like select, insert, etc.
      if (['select', 'insert', 'update', 'delete', 'where'].includes(prop)) {
        // Return a function that returns a chainable object
        return function() {
          console.error(`[DB Error] Database not connected, cannot execute ${prop}()`, originalError);
          // Return a chainable object with the same methods
          return createFallbackDb(originalError);
        };
      }

      // For non-chainable methods that should return data
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        // Make it thenable so async/await and promises work
        if (prop === 'then') {
          return (resolve, reject) => {
            reject(new Error(`Database not connected: ${originalError.message}`));
          };
        }
        // Support catch
        if (prop === 'catch') {
          return (errorHandler) => {
            try {
              return errorHandler(new Error(`Database not connected: ${originalError.message}`));
            } catch (e) {
              console.error('[DB Fallback] Error in catch handler:', e);
              return Promise.reject(e);
            }
          };
        }
        // Support finally
        if (prop === 'finally') {
          return (finallyHandler) => {
            try {
              finallyHandler();
            } catch (e) {
              console.error('[DB Fallback] Error in finally handler:', e);
            }
            return Promise.reject(new Error(`Database not connected: ${originalError.message}`));
          };
        }
      }
      
      // For anything else, return a function that logs and returns the proxy
      return function() {
        console.error(`[DB Error] Database not connected. Cannot execute ${prop}()`, originalError);
        return createFallbackDb(originalError); 
      };
    }
  });
}

export { db }; 