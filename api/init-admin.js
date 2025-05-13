import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // This endpoint should be secured in production!
  // For demo purposes, it's open but you should add authentication

  try {
    // Check if admin already exists
    const existingUsers = await db.select().from(users).where(eq(users.username, 'admin'));
    
    if (existingUsers.length > 0) {
      return res.status(200).json({ message: 'Admin user already exists' });
    }
    
    // Create admin user
    const result = await db.insert(users).values({
      username: 'admin',
      password: 'admin123', // In production, use bcrypt to hash passwords
      isAdmin: true
    }).returning();

    console.log('Admin user created:', result);
    res.status(201).json({ success: true, message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
}
