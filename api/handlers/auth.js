// Auth handlers
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { sql } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

// Password hashing functions
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  try {
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

export default function makeAuthHandlers({ db, users }) {
  return {
    handleLogin: async function (req, res) {
      const { username, password } = req.body;
      
      console.log('Login attempt:', { username, timestamp: new Date().toISOString() });
      
      // Validate required fields
      if (!username || !password) {
        console.log('Login failed: Missing credentials');
        return res.status(400).json({ error: 'Username and password are required' });
      }

      try {
        console.log(`Attempting to find user: ${username}`);
        
        // Find user by username
        const foundUsers = await db.select().from(users).where(sql`username = ${username}`);
        console.log('Query result:', { found: foundUsers.length > 0 });
        
        const user = foundUsers[0];
        if (!user) {
          console.log(`Login failed: User not found - ${username}`);
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Compare password using scrypt
        const passwordMatch = await comparePasswords(password, user.password);
        console.log('Password comparison result:', { match: passwordMatch });

        if (!passwordMatch) {
          console.log(`Login failed: Incorrect password for user - ${username}`);
          return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Success
        console.log(`Login successful for user: ${username}`);
        return res.status(200).json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
          error: 'Server error', 
          message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
        });
      }
    },
    handleLogout: async function (req, res) {
      // Implement logout logic (e.g., destroy session/cookie)
      res.status(200).json({ success: true, message: 'Logged out' });
    },
    handleRegister: async function (req, res) {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      try {
        // Check if user exists
        const foundUsers = await db.select().from(users).where(sql`username = ${username}`);
        if (foundUsers.length > 0) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        // Hash password using scrypt
        const hashedPassword = await hashPassword(password);
        // Create user
        const result = await db.insert(users).values({
          username,
          password: hashedPassword,
          isAdmin: false
        }).returning();
        return res.status(201).json({
          success: true,
          user: {
            id: result[0].id,
            username: result[0].username,
            isAdmin: result[0].isAdmin
          }
        });
      } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Server error', message: error.message });
      }
    },
    handleGetUser: async function (req, res) {
      // Implement get user logic (e.g., from session/cookie)
      res.status(200).json({ user: null });
    }
  };
} 