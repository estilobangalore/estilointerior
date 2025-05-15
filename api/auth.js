import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the route from the URL path or query param
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = url.searchParams.get('action');

  // Route the request based on the path and method
  switch (route) {
    case 'login':
      if (req.method === 'POST') {
        return await handleLogin(req, res);
      }
      break;
    case 'logout':
      if (req.method === 'POST') {
        return await handleLogout(req, res);
      }
      break;
    case 'register':
      if (req.method === 'POST') {
        return await handleRegister(req, res);
      }
      break;
    case 'user':
      if (req.method === 'GET') {
        return await handleGetUser(req, res);
      }
      break;
    default:
      return res.status(404).json({ error: 'API route not found' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Login handler
async function handleLogin(req, res) {
  const { username, password } = req.body;
  
  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    console.log(`Attempting login for user: ${username}`);
    
    // Find user by username
    const foundUsers = await db.select().from(users).where(eq(users.username, username));
    const user = foundUsers[0];

    if (!user) {
      console.log(`Login failed: User not found - ${username}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // In a real app, you would verify the password with bcrypt like this:
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // For demo purposes, we're doing a simple check
    const passwordMatch = password === user.password;
    
    if (!passwordMatch) {
      console.log(`Login failed: Password mismatch for user - ${username}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create a simplified user object without the password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    };
    
    // In a real app, you would set a session cookie here
    // For demo purposes, let's assume the client will store this info
    
    console.log(`Login successful for user: ${username}`);
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
}

// Logout handler
async function handleLogout(req, res) {
  try {
    // In a real app with sessions, you would clear the session here
    // For this demo, we'll just return a success response
    
    console.log('User logged out successfully');
    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Logout failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
}

// Registration handler
async function handleRegister(req, res) {
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

// Get user handler
async function handleGetUser(req, res) {
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