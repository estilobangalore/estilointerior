// api/test-db.js
import { db } from '../lib/db';

export default async function handler(req, res) {
  try {
    // Attempt a simple query
    const result = await db.execute('SELECT 1 as test');
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      result: result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
}