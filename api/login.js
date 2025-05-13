import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  try {
    // Find user by username
    const foundUsers = await db.select().from(users).where(eq(users.username, username));
    const user = foundUsers[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Here in a real app you would verify the password with bcrypt
    // For now, we'll just do a simple check for demo purposes
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create a simplified user object without the password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };

    return res.status(200).json({ 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
