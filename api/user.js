import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real app, you would check for a session/token here
    // For this demo, let's assume a user ID would be in the session
    // This is placeholder logic - you'll need to implement proper session handling
    const userId = req.session?.userId || null;
    
    if (!userId) {
      // No authenticated user
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Look up the user by ID
    const foundUsers = await db.select().from(users).where(eq(users.id, userId));
    const user = foundUsers[0];

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Return the user without sensitive information
    const safeUser = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };

    return res.status(200).json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user information',
      message: error.message || 'Unknown error'
    });
  }
} 