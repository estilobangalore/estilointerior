import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';

// In a real app, this would use a proper session or token system
// For demo purposes, this is simplified
export default async function handler(req, res) {
  const { username } = req.query;

  if (!username) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const foundUsers = await db.select().from(users).where(eq(users.username, username));
    const user = foundUsers[0];

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Create a simplified user object without the password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
