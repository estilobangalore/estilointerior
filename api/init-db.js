import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

export default async function handler(req, res) {
  // Add security check to prevent unauthorized access
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.SETUP_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);

    // Create testimonials table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create portfolio_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create consultations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        project_type TEXT NOT NULL,
        requirements TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        address TEXT,
        budget TEXT,
        preferred_contact_time TEXT,
        source TEXT DEFAULT 'website',
        notes TEXT
      );
    `);
    
    // Create a sample admin user
    await db.execute(sql`
      INSERT INTO users (username, password, is_admin)
      VALUES ('admin', 'admin123', TRUE)
      ON CONFLICT (username) DO NOTHING;
    `);
    
    res.status(200).json({ 
      success: true, 
      message: 'Database tables initialized successfully'
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to initialize database tables',
      error: error.message
    });
  }
}
