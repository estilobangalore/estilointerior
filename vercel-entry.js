// Custom entry point for Vercel deployment
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dbSchema from './shared/schema.js';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { sql, desc } from 'drizzle-orm';

// Schema definitions
import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";

const scryptAsync = promisify(scrypt);

// Set up a minimal working express app
const app = express();

// Enable CORS with credentials
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Parse JSON bodies
app.use(express.json());

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  }
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
}

app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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

// Define schema
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: timestamp("date").notNull(),
  projectType: text("project_type").notNull(),
  requirements: text("requirements").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  address: text("address"),
  budget: text("budget"),
  preferredContactTime: text("preferred_contact_time"),
  source: text("source").default("website"),
  notes: text("notes"),
});

const localSchema = { users, testimonials, portfolioItems, consultations };

// Initialize database connection
let db;
try {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    throw new Error('DATABASE_URL is not set');
  }
  console.log('🔄 Attempting database connection...');
  const queryClient = postgres(process.env.DATABASE_URL, {
    ssl: {
      rejectUnauthorized: false
    },
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10
  });
  db = drizzle(queryClient, { schema: localSchema });
  console.log('✅ Database connection established');

  // Create tables if they don't exist
  console.log('🔄 Ensuring database tables exist...');
  const createTables = async () => {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          is_admin BOOLEAN NOT NULL DEFAULT false
        );
      `);
      console.log('✅ Users table created/verified');

      // Create initial admin user if it doesn't exist
      const adminUser = await db.select().from(users).where(sql`username = 'admin'`).limit(1);
      if (adminUser.length === 0) {
        const hashedPassword = await hashPassword('Admin@123');
        await db.insert(users).values({
          username: 'admin',
          password: hashedPassword,
          isAdmin: true
        });
        console.log('✅ Admin user created');
      } else {
        // Update existing admin user's password if needed
        const currentAdmin = adminUser[0];
        // Check if password needs to be updated (if it's not in the correct format)
        if (!currentAdmin.password.includes('.')) {
          const hashedPassword = await hashPassword('Admin@123');
          await db.update(users)
            .set({ password: hashedPassword })
            .where(sql`username = 'admin'`);
          console.log('✅ Admin password updated to use scrypt');
        }
      }

      // Create testimonials table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS testimonials (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // Create portfolio_items table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS portfolio_items (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          category TEXT NOT NULL,
          featured BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // Create consultations table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS consultations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          date TIMESTAMP NOT NULL,
          project_type TEXT NOT NULL,
          requirements TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          address TEXT,
          budget TEXT,
          preferred_contact_time TEXT,
          source TEXT DEFAULT 'website',
          notes TEXT
        );
      `);

      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Error setting up database:', error);
      throw error;
    }
  };

  createTables().catch(console.error);
} catch (error) {
  console.error('❌ Database connection failed:', error);
}

// Passport configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    console.log('🔄 Attempting login for user:', username);
    
    if (!db) {
      throw new Error('Database not connected');
    }

    const userResults = await db.select().from(users).where(sql`username = ${username}`).limit(1);
    const user = userResults[0];

    if (!user) {
      console.log('❌ User not found:', username);
      return done(null, false, { message: 'Invalid username or password' });
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      console.log('❌ Invalid password for user:', username);
      return done(null, false, { message: 'Invalid username or password' });
    }

    console.log('✅ Login successful for user:', username);
    return done(null, {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log('Deserializing user:', user);
  done(null, user);
});

// Authentication middleware with enhanced logging
const isAuthenticated = (req, res, next) => {
  console.log('🔒 Authentication check:', {
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session
  });
  
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

const isAdmin = (req, res, next) => {
  console.log('👑 Admin check:', {
    isAuthenticated: req.isAuthenticated(),
    user: req.user,
    session: req.session
  });
  
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
};

// Login endpoint
app.post('/api/login', (req, res, next) => {
  console.log('🔄 Login request received:', { username: req.body.username, body: req.body });
  
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('❌ Authentication error:', err);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
    
    if (!user) {
      console.log('❌ Authentication failed:', info?.message);
      return res.status(401).json({ message: info?.message || 'Invalid username or password' });
    }
    
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('❌ Login error:', loginErr);
        return res.status(500).json({ message: 'Error during login', error: loginErr.message });
      }
      
      // Set session cookie explicitly
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('❌ Session save error:', saveErr);
          return res.status(500).json({ message: 'Error saving session', error: saveErr.message });
        }
        
        console.log('✅ Login successful:', {
          user: user.username,
          isAdmin: user.isAdmin,
          sessionID: req.sessionID
        });
        
        res.status(200).json({
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
          }
        });
      });
    });
  })(req, res, next);
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  const username = req.user?.username;
  req.logout((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ message: 'Error during logout' });
    }
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error('❌ Session destruction error:', sessionErr);
      }
      res.clearCookie('sessionId');
      console.log('✅ Logout successful for user:', username);
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

// Check auth status endpoint
app.get('/api/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// Add error handling middleware first
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      version: '1.0.2',
      database: db ? 'connected' : 'not connected'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed'
    });
  }
});

// Add a contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    console.log('📝 Contact form data:', req.body);
    
    // Simple validation
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide name, email, and message'
      });
    }
    
    // Save as a consultation with contact_form source
    console.log('💾 Saving contact form message...');
    const result = await db.insert(localSchema.consultations).values({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || 'Not provided',
      date: new Date(),
      projectType: 'Contact Form Message',
      requirements: req.body.message,
      status: 'pending',
      source: 'contact_form',
      address: req.body.address || 'Not provided'
    }).returning();

    console.log('✅ Contact form saved successfully:', result[0]);
    return res.status(201).json({
      success: true,
      message: 'Message received successfully',
      consultation: result[0]
    });
  } catch (error) {
    console.error('❌ Error handling contact form:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'There was an error processing your request'
    });
  }
});

// Add a consultation form endpoint
app.post('/api/consultations', async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    console.log('📝 Consultation form data:', req.body);
    
    // Simple validation
    if (!req.body.name || !req.body.email || !req.body.phone || !req.body.requirements) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide name, email, phone, and requirements'
      });
    }

    // Validate date format
    let formattedDate;
    try {
      formattedDate = new Date(req.body.date);
      if (isNaN(formattedDate.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Please provide a valid date'
        });
      }
    } catch (dateError) {
      return res.status(400).json({
        error: 'Invalid date',
        message: 'Please provide a valid date format'
      });
    }
    
    console.log('💾 Saving consultation...');
    // Save the consultation
    const result = await db.insert(localSchema.consultations).values({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      date: formattedDate,
      projectType: req.body.projectType,
      requirements: req.body.requirements,
      status: 'pending',
      source: 'website',
      address: req.body.address,
      budget: req.body.budget,
      preferredContactTime: req.body.preferredContactTime
    }).returning();

    console.log('✅ Consultation saved successfully:', result[0]);
    return res.status(201).json({
      success: true,
      message: 'Consultation request received successfully',
      consultation: result[0]
    });
  } catch (error) {
    console.error('❌ Error handling consultation form:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'There was an error processing your request'
    });
  }
});

// Add portfolio items endpoint
app.get('/api/portfolio', async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    const items = await db.select().from(localSchema.portfolioItems);
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Error fetching portfolio items'
    });
  }
});

// Add testimonials endpoint
app.get('/api/testimonials', async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    const items = await db.select().from(localSchema.testimonials);
    return res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Error fetching testimonials'
    });
  }
});

// Add consultations endpoint for dashboard with type filtering
app.get('/api/consultations', isAdmin, async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    const { type } = req.query; // 'booking' or 'contact'
    console.log('🔍 Fetching consultations with type:', type);

    let query = db.select().from(localSchema.consultations);

    // Filter based on type
    if (type === 'booking') {
      query = query.where(sql`source = 'website' AND project_type != 'Contact Form Message'`);
    } else if (type === 'contact') {
      query = query.where(sql`source = 'contact_form' OR project_type = 'Contact Form Message'`);
    }

    // Order by creation date, newest first
    query = query.orderBy(desc(localSchema.consultations.createdAt));

    const consultations = await query;
    console.log(`✅ Found ${consultations.length} consultations of type: ${type || 'all'}`);
    return res.status(200).json(consultations);
  } catch (error) {
    console.error('❌ Error fetching consultations:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Error fetching consultations'
    });
  }
});

// Add endpoint to create portfolio item
app.post('/api/portfolio', isAdmin, async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    console.log('🔒 Auth check - User:', req.user);
    console.log('📝 Creating new portfolio item:', req.body);

    // Validate required fields
    const requiredFields = ['title', 'description', 'imageUrl', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        error: 'Missing required fields',
        message: `Please provide: ${missingFields.join(', ')}`
      });
    }

    const newItem = await db.insert(localSchema.portfolioItems)
      .values({
        title: req.body.title,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        category: req.body.category,
        featured: req.body.featured || false
      })
      .returning();

    console.log('✅ Portfolio item created:', newItem[0]);
    return res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      item: newItem[0]
    });
  } catch (error) {
    console.error('❌ Error creating portfolio item:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Error creating portfolio item'
    });
  }
});

// Add endpoint to create testimonial
app.post('/api/testimonials', isAdmin, async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    console.log('🔒 Auth check - User:', req.user);
    console.log('📝 Creating new testimonial:', req.body);

    // Validate required fields
    const requiredFields = ['name', 'role', 'content', 'imageUrl'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        error: 'Missing required fields',
        message: `Please provide: ${missingFields.join(', ')}`
      });
    }

    const newItem = await db.insert(localSchema.testimonials)
      .values({
        name: req.body.name,
        role: req.body.role,
        content: req.body.content,
        imageUrl: req.body.imageUrl
      })
      .returning();

    console.log('✅ Testimonial created:', newItem[0]);
    return res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      item: newItem[0]
    });
  } catch (error) {
    console.error('❌ Error creating testimonial:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Error creating testimonial'
    });
  }
});

// Add endpoint to get dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    // Check if user is authenticated and is admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    // Get counts from different tables
    const [consultationsCount, portfolioCount, testimonialsCount] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(localSchema.consultations),
      db.select({ count: sql`count(*)` }).from(localSchema.portfolioItems),
      db.select({ count: sql`count(*)` }).from(localSchema.testimonials)
    ]);

    // Get recent consultations
    const recentConsultations = await db
      .select()
      .from(localSchema.consultations)
      .orderBy(desc(localSchema.consultations.createdAt))
      .limit(5);

    return res.status(200).json({
      stats: {
        consultations: consultationsCount[0]?.count || 0,
        portfolio: portfolioCount[0]?.count || 0,
        testimonials: testimonialsCount[0]?.count || 0
      },
      recentConsultations
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Error fetching dashboard stats'
    });
  }
});

// Add endpoint to delete portfolio item
app.delete('/api/portfolio/:id', isAdmin, async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    console.log('🔒 Auth check - User:', req.user);
    const { id } = req.params;
    console.log('🗑️ Attempting to delete portfolio item:', id);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid portfolio item ID'
      });
    }

    const deleted = await db
      .delete(localSchema.portfolioItems)
      .where(sql`id = ${id}`)
      .returning();

    if (!deleted.length) {
      console.log('❌ Portfolio item not found:', id);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Portfolio item not found'
      });
    }

    console.log('✅ Portfolio item deleted:', deleted[0]);
    return res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully',
      item: deleted[0]
    });
  } catch (error) {
    console.error('❌ Error deleting portfolio item:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Error deleting portfolio item'
    });
  }
});

// Add endpoint to delete testimonial
app.delete('/api/testimonials/:id', isAdmin, async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    console.log('🔒 Auth check - User:', req.user);
    const { id } = req.params;
    console.log('🗑️ Attempting to delete testimonial:', id);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid testimonial ID'
      });
    }

    const deleted = await db
      .delete(localSchema.testimonials)
      .where(sql`id = ${id}`)
      .returning();

    if (!deleted.length) {
      console.log('❌ Testimonial not found:', id);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Testimonial not found'
      });
    }

    console.log('✅ Testimonial deleted:', deleted[0]);
    return res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
      item: deleted[0]
    });
  } catch (error) {
    console.error('❌ Error deleting testimonial:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Error deleting testimonial'
    });
  }
});

// Add endpoint to update consultation status
app.patch('/api/consultations/:id/status', isAdmin, async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    const { id } = req.params;
    const { status } = req.body;

    console.log('🔄 Updating consultation status:', { id, status });

    // Validate inputs
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid consultation ID'
      });
    }

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be one of: pending, confirmed, completed, cancelled'
      });
    }

    // Update the consultation
    const updated = await db
      .update(localSchema.consultations)
      .set({
        status: status
      })
      .where(sql`id = ${id}`)
      .returning();

    if (!updated.length) {
      console.log('❌ Consultation not found:', id);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Consultation not found'
      });
    }

    console.log('✅ Consultation status updated:', updated[0]);
    return res.status(200).json({
      success: true,
      message: 'Consultation status updated successfully',
      consultation: updated[0]
    });
  } catch (error) {
    console.error('❌ Error updating consultation status:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Error updating consultation status'
    });
  }
});

// Add endpoint to update consultation notes
app.patch('/api/consultations/:id/notes', isAdmin, async (req, res) => {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    const { id } = req.params;
    const { notes } = req.body;

    console.log('🔄 Updating consultation notes:', { id });

    // Validate inputs
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Please provide a valid consultation ID'
      });
    }

    if (typeof notes !== 'string') {
      return res.status(400).json({
        error: 'Invalid notes',
        message: 'Notes must be a string'
      });
    }

    // Update the consultation
    const updated = await db
      .update(localSchema.consultations)
      .set({
        notes: notes
      })
      .where(sql`id = ${id}`)
      .returning();

    if (!updated.length) {
      console.log('❌ Consultation not found:', id);
      return res.status(404).json({
        error: 'Not Found',
        message: 'Consultation not found'
      });
    }

    console.log('✅ Consultation notes updated:', updated[0]);
    return res.status(200).json({
      success: true,
      message: 'Consultation notes updated successfully',
      consultation: updated[0]
    });
  } catch (error) {
    console.error('❌ Error updating consultation notes:', error);
    return res.status(500).json({
      error: 'Server error',
      message: error.message || 'Error updating consultation notes'
    });
  }
});

// Handle all API routes
app.use('/api', async (req, res) => {
  const path = req.path;
  const method = req.method;

  console.log(`Handling ${method} request to ${path}`);

  try {
    switch (`${method} ${path}`) {
      case 'POST /logout':
        req.logout((err) => {
          if (err) {
            return res.status(500).json({ message: 'Error during logout' });
          }
          res.status(200).json({ message: 'Logged out successfully' });
        });
        break;

      case 'POST /auth/register':
      case 'POST /register':
        // Handle register
        res.status(501).json({
          error: 'Not Implemented',
          message: 'Register endpoint is not yet implemented'
        });
        break;
      case 'GET /auth/user':
        // Handle get user
        res.status(501).json({
          error: 'Not Implemented',
          message: 'Get user endpoint is not yet implemented'
        });
        break;
      default:
        if (!res.headersSent) {
          res.status(404).json({
            error: 'Not Found',
            message: `API endpoint not found: ${path}`
          });
        }
    }
  } catch (error) {
    console.error('API error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
      });
    }
  }
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint not found: ${req.path}`
  });
});

// Serve static files
app.use(express.static('public'));

// Handle all other routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Estilo Interior Design API</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 1rem; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .status { padding: 1rem; background: #f0f0f0; border-radius: 4px; margin: 1rem 0; }
        .status.ok { background: #e6ffe6; }
        pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>Estilo Interior Design API</h1>
      <div class="status ok">
        <strong>Status:</strong> API Server Running
      </div>
      <p>This is a backend API server. Available endpoints:</p>
      <ul>
        <li><code>/api/health</code> - Health check endpoint</li>
        <li><code>/api/contact</code> - Contact form submission</li>
        <li><code>/api/consultations</code> - Consultation request submission</li>
        <li><code>/api/portfolio</code> - Get portfolio items</li>
        <li><code>/api/testimonials</code> - Get testimonials</li>
      </ul>
      <p>The frontend application should be deployed separately.</p>
    </body>
    </html>
  `);
});

// Export the Express app
export default app; 