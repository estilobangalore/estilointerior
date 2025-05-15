import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;
  
  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Validate username length
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  
  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    console.log(`Attempting to register user: ${username}`);
    
    // Check if username already exists
    const existingUsers = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // In a real application, you would hash the password:
    // const hashedPassword = await bcrypt.hash(password, 10);
    // For demo purposes, we'll use the plain password
    const hashedPassword = password;
    
    // By default, new users aren't admins
    // In a real app, you might check if this is the first user or require admin approval
    const userCount = await db.select({ count: db.fn.count() }).from(users);
    const isFirstUser = userCount.length === 0 || userCount[0].count === 0;
    
    // Insert new user
    const result = await db.insert(users).values({
      username,
      password: hashedPassword,
      isAdmin: isFirstUser // Only the first user gets admin privileges by default
    }).returning();
    
    const newUser = result[0];
    
    // Create a safe user object without the password
    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      isAdmin: newUser.isAdmin
    };
    
    console.log(`User registered successfully: ${username} (Admin: ${newUser.isAdmin})`);
    
    return res.status(201).json(safeUser);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
} 