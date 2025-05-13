import { db } from '../lib/db';
import { users } from '../lib/schema';
import { sql } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Log database URL format (not the actual value for security)
    const dbUrl = process.env.DATABASE_URL;
    console.log('Database URL is set:', !!dbUrl);
    if (dbUrl) {
      console.log('Database URL format check:');
      console.log('- Starts with postgres:// or postgresql://', 
        dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'));
      console.log('- Contains @ symbol:', dbUrl.includes('@'));
      console.log('- URL length:', dbUrl.length);
    }

    // Test users table
    const userCount = await db.select({ count: sql`count(*)` }).from(users);
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      userCount: userCount[0].count,
      hasDbUrl: !!process.env.DATABASE_URL,
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error details:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed',
      error: error.message,
      errorType: error.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 