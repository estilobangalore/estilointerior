import { db } from '../lib/db';
import { users } from '../lib/schema';
import { sql } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    // Test basic query
    const result = await db.execute('SELECT 1 as test');
    
    // Test users table
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      basicQuery: result,
      userCount: userCount[0].count,
      databaseUrl: process.env.DATABASE_URL ? 'Set (value hidden)' : 'Not set',
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 