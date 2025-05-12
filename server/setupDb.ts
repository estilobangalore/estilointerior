import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './db';
import fs from 'fs';
import path from 'path';

// Migrate the database to the latest schema
export async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('Skipping database setup: DATABASE_URL not set');
    return;
  }
  
  try {
    console.log('Setting up database...');
    
    // Check if migrations folder exists
    const migrationsFolder = './migrations';
    const metaFolder = path.join(migrationsFolder, 'meta');
    const journalFile = path.join(metaFolder, '_journal.json');
    
    // Create directories if they don't exist
    if (!fs.existsSync(migrationsFolder)) {
      fs.mkdirSync(migrationsFolder, { recursive: true });
    }
    
    if (!fs.existsSync(metaFolder)) {
      fs.mkdirSync(metaFolder, { recursive: true });
    }
    
    // Create journal file if it doesn't exist
    if (!fs.existsSync(journalFile)) {
      fs.writeFileSync(journalFile, JSON.stringify({
        version: "5",
        dialect: "pg",
        entries: []
      }, null, 2));
    }
    
    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder });
    
    console.log('Database setup complete');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
} 