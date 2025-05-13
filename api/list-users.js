import { db } from '../lib/db';

export default async function handler(req, res) {
  try {
    // Attempt to query users with basic SQL
    const result = await db.execute('SELECT id, username, is_admin FROM users');
    
    res.status(200).json({ 
      success: true, 
      message: 'Users retrieved successfully',
      count: result.length,
      users: result.map(u => ({ id: u.id, username: u.username, isAdmin: u.is_admin }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
} 