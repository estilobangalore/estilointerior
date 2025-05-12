import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import config from "./config";
import { z } from "zod";
import { AuthenticationError } from "./errors";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Export hashPassword for use in storage.ts
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // Check if the stored password contains a salt
    if (!stored.includes('.')) {
      console.warn('Stored password is not properly hashed');
      // Direct comparison for legacy passwords (not recommended for production)
      return supplied === stored;
    }
    
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    if (hashedBuf.length !== suppliedBuf.length) {
      console.warn(`Buffer length mismatch: stored=${hashedBuf.length}, supplied=${suppliedBuf.length}`);
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Create admin user if it doesn't exist
async function createAdminUser() {
  try {
    const adminExists = await storage.getUserByUsername(ADMIN_USERNAME);
    if (!adminExists) {
      console.log('Creating admin user...');
      const hashedPassword = await hashPassword(ADMIN_PASSWORD);
      console.log('Generated hashed password for admin:', hashedPassword);
      
      const adminUser = await storage.createUser({
        username: ADMIN_USERNAME,
        password: hashedPassword,
        isAdmin: true  // Explicitly set isAdmin to true
      });
      console.log('Admin user created successfully:', { ...adminUser, password: '[REDACTED]' });
    } else {
      console.log('Admin user already exists:', { ...adminExists, password: '[REDACTED]' });
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Call createAdminUser when the server starts
createAdminUser();

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate username
      if (!username || username.length < 3) {
        return res.status(400).json({ 
          message: "Username must be at least 3 characters long" 
        });
      }

      // Validate password
      try {
        passwordSchema.parse(password);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Invalid password", 
            errors: error.errors 
          });
        }
        throw error;
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Username already exists" 
        });
      }

      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ 
            message: "Error logging in after registration" 
          });
        }
        return res.status(201).json({ 
          id: user.id, 
          username: user.username,
          isAdmin: user.isAdmin 
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        message: "Error creating user" 
      });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log('Login attempt:', { username });

      if (!username || !password) {
        throw new AuthenticationError("Username and password are required");
      }

      const user = await storage.getUserByUsername(username);
      console.log('User found:', user ? { ...user, password: '[REDACTED]' } : 'no');

      if (!user) {
        throw new AuthenticationError("Invalid username or password");
      }

      try {
        console.log('Comparing passwords...');
        const isValid = await comparePasswords(password, user.password);
        console.log('Password comparison result:', isValid);
        
        if (!isValid) {
          throw new AuthenticationError("Invalid username or password");
        }

        // Use Passport's login instead of directly setting session
        req.login(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: "Error during login" });
          }
          
          console.log('Login successful:', { 
            id: user.id, 
            username: user.username, 
            isAdmin: user.isAdmin 
          });

          res.json({ 
            message: "Login successful", 
            user: {
              id: user.id,
              username: user.username,
              isAdmin: user.isAdmin
            }
          });
        });
      } catch (error) {
        console.error('Password comparison error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ 
          message: "Internal server error", 
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Error logging out" });
      } else {
        res.json({ message: "Logged out successfully" });
      }
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Not authenticated" 
      });
    }
    res.json({ 
      id: req.user!.id, 
      username: req.user!.username,
      isAdmin: req.user!.isAdmin 
    });
  });
}
