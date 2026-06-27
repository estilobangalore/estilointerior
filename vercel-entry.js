// Custom entry point for Vercel deployment
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { sql, desc } from 'drizzle-orm';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import sanitizeHtml from 'sanitize-html';

const scryptAsync = promisify(scrypt);
const PostgresStore = connectPgSimple(session);

// Set up a minimal working express app
const app = express();

// Apply security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Configure allowed CORS origins safely
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    const isAllowed = 
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') || 
      origin.endsWith('estilointerior.com') || 
      origin === 'https://estilointerior.com' ||
      origin.endsWith('estilointerior.in') ||
      origin === 'https://estilointerior.in';

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Parse JSON bodies with limits
app.use(express.json({ limit: '100kb' }));

// Session configuration
const sessionConfig = {
  store: new PostgresStore({
    conObject: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax', // Secure Lax cookie for CSRF mitigation
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

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(username, otpCode) {
  const recipient = 'estilo.bangalore@gmail.com';
  console.log(`🔑 [OTP SYSTEM] Verification Code for ${username}: ${otpCode}`);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`ℹ️ SMTP credentials not set. OTP email simulation only. Sent OTP code to estilo.bangalore@gmail.com via logs.`);
    return true;
  }

  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Estilo Interior'}" <${process.env.SMTP_FROM_EMAIL || 'no-reply@estilointerior.in'}>`,
      to: recipient,
      subject: 'Password Reset OTP - Estilo Interior',
      text: `Your OTP verification code for resetting the password of ${username} is: ${otpCode}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #F59E0B; margin-bottom: 20px;">Estilo Interior</h2>
          <p>A password reset request was initiated for username: <strong>${username}</strong>.</p>
          <p>Please use the following 6-digit One-Time Password (OTP) to complete your password reset:</p>
          <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #D97706; margin: 25px 0; border-radius: 4px;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 13px; line-height: 1.5;">This code is valid for <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset OTP email successfully sent to ${recipient}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email via SMTP:`, error.message);
    return false;
  }
}

// Password hashing functions
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  try {
    if (!stored || !stored.includes('.')) {
      console.warn('Stored password is not properly hashed');
      return false;
    }
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
import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";

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

const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

const localSchema = { users, testimonials, portfolioItems, consultations, siteSettings, otps };

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
      rejectUnauthorized: true // Secure SSL certificate checks
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

      // Create initial admin user if it doesn't exist
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
      
      const adminUser = await db.select().from(users).where(sql`username = ${ADMIN_USERNAME}`).limit(1);
      if (adminUser.length === 0) {
        const hashedPassword = await hashPassword(ADMIN_PASSWORD);
        await db.insert(users).values({
          username: ADMIN_USERNAME,
          password: hashedPassword,
          isAdmin: true
        });
        console.log('✅ Admin user created');
      } else {
        const currentAdmin = adminUser[0];
        if (!currentAdmin.password.includes('.')) {
          const hashedPassword = await hashPassword(ADMIN_PASSWORD);
          await db.update(users)
            .set({ password: hashedPassword })
            .where(sql`username = ${ADMIN_USERNAME}`);
          console.log('✅ Admin password updated to use scrypt');
        }
      }

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

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS otps (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL,
          otp TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL
        );
      `);

      // Seed settings if empty
      const existingSettings = await db.select().from(siteSettings).limit(1);
      if (existingSettings.length === 0) {
        console.log('🌱 Seeding site settings defaults...');
        const defaults = [
          { key: 'hero_title', value: 'Estilo Interior' },
          { key: 'hero_subtitle', value: 'Luxury Interior Design in Bangalore' },
          { key: 'hero_image_url', value: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000' },
          { key: 'contact_phone', value: '+91 98806 52548' },
          { key: 'contact_email', value: 'estilo.bangalore@gmail.com' },
          { key: 'contact_address', value: 'Bangalore, India' },
          { key: 'contact_instagram', value: 'https://instagram.com/estilobangalore' },
          { key: 'contact_facebook', value: 'https://facebook.com' },
          { key: 'contact_pinterest', value: 'https://pinterest.com' },
          { key: 'contact_whatsapp', value: '+919880652548' },
          { key: 'about_content', value: 'Luxury residential and commercial interior design studio based in Bangalore. We create beautiful, functional spaces customized to your lifestyle.' },
          { key: 'about_image_url', value: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2000' },
          { key: 'about_vision', value: 'To be the leading luxury interior design firm known for timeless elegance and bespoke spaces.' },
          { key: 'about_mission', value: 'To transform our clients\' visions into custom realities through exceptional design, premium craftsmanship, and seamless execution.' },
          { key: 'privacy_policy_content', value: 'Privacy Policy Content. We value your privacy and protect your personal information.' },
          { key: 'terms_of_service_content', value: 'Terms of Service Content. By using our website, you agree to these terms.' }
        ];
        for (const item of defaults) {
          await db.insert(siteSettings).values(item);
        }
      }

      console.log('✅ Database setup and verification completed successfully');
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
    if (!db) {
      throw new Error('Database not connected');
    }

    const userResults = await db.select().from(users).where(sql`username = ${username}`).limit(1);
    const user = userResults[0];

    if (!user) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return done(null, false, { message: 'Invalid username or password' });
    }

    return done(null, {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
};

// Rate limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

// GET user endpoint
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json(req.user);
  }
  return res.status(401).json({ message: 'Not authenticated' });
});

// Login endpoint
app.post('/api/login', authLimiter, (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info?.message || 'Invalid username or password' });
    }
    
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Passport req.logIn error:', loginErr);
        return res.status(500).json({ 
          message: 'Error during login', 
          error: loginErr.message, 
          stack: loginErr.stack 
        });
      }
      
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ 
            message: 'Error saving session',
            error: saveErr.message,
            stack: saveErr.stack
          });
        }
        
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
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    req.session.destroy((sessionErr) => {
      res.clearCookie('sessionId');
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

// OTP Password Reset endpoints
app.post('/api/auth/request-reset', authLimiter, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const userResults = await db.select().from(users).where(sql`username = ${username}`).limit(1);
    const user = userResults[0];

    if (!user) {
      return res.status(200).json({ message: 'If the account exists, an OTP has been sent to the registered email.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.delete(otps).where(sql`username = ${username}`);
    await db.insert(otps).values({ username, otp: otpCode, expiresAt });
    await sendOtpEmail(username, otpCode);

    return res.status(200).json({ message: 'If the account exists, an OTP has been sent to the registered email.' });
  } catch (error) {
    console.error('❌ Request reset error:', error);
    return res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

app.post('/api/auth/verify-reset', authLimiter, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { username, otp, password } = req.body;
    if (!username || !otp || !password) {
      return res.status(400).json({ message: 'Username, OTP, and new password are required' });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password does not meet complexity requirements' });
    }

    const otpResults = await db.select().from(otps).where(sql`username = ${username} AND otp = ${otp}`).limit(1);
    const storedOtp = otpResults[0];

    if (!storedOtp || new Date(storedOtp.expiresAt) < new Date()) {
      if (storedOtp) await db.delete(otps).where(sql`id = ${storedOtp.id}`);
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    const userResults = await db.select().from(users).where(sql`username = ${username}`).limit(1);
    const user = userResults[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await hashPassword(password);
    await db.update(users).set({ password: hashedPassword }).where(sql`id = ${user.id}`);
    await db.delete(otps).where(sql`id = ${storedOtp.id}`);

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('❌ Verify reset error:', error);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
});

// GET site settings
app.get('/api/settings', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const settings = await db.select().from(siteSettings);
    const result = {};
    settings.forEach(item => {
      result[item.key] = item.value;
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error fetching site settings:', error);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update site settings (Admin only)
app.post('/api/settings', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid updates object' });
    }

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value !== 'string') continue;
      
      const existing = await db.select().from(siteSettings).where(sql`key = ${key}`).limit(1);
      if (existing.length > 0) {
        await db.update(siteSettings)
          .set({ value, updatedAt: new Date() })
          .where(sql`key = ${key}`);
      } else {
        await db.insert(siteSettings).values({ key, value });
      }
    }

    return res.status(200).json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('❌ Error updating site settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    version: '1.0.5',
    database: db ? 'connected' : 'not connected'
  });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { name, email, phone, requirements, address } = req.body;
    
    if (!name || !email || !phone || !requirements) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await db.insert(consultations).values({
      name,
      email,
      phone,
      date: new Date(),
      projectType: 'Contact Inquiry',
      requirements,
      address: address || null,
      status: 'pending',
      createdAt: new Date(),
      source: 'contact_form'
    }).returning();

    return res.status(201).json({ success: true, consultation: result[0] });
  } catch (error) {
    console.error('❌ Contact submission error:', error);
    return res.status(500).json({ error: 'Failed to submit message' });
  }
});

// Booking consultation endpoint
app.post('/api/consultations', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { name, email, phone, date, projectType, requirements, address, budget, preferredContactTime } = req.body;

    const sanitizeOptions = { allowedTags: [], allowedAttributes: {} };
    const cleanString = (val) => typeof val === 'string' ? sanitizeHtml(val, sanitizeOptions).trim() : val;

    const nameClean = cleanString(name);
    const emailClean = cleanString(email);
    const phoneClean = cleanString(phone);
    const projectTypeClean = cleanString(projectType);
    const requirementsClean = cleanString(requirements);
    const addressClean = cleanString(address);
    const budgetClean = cleanString(budget);
    const preferredContactTimeClean = cleanString(preferredContactTime);

    if (!nameClean || !emailClean || !phoneClean || !date || !projectTypeClean || !requirementsClean) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await db.insert(consultations).values({
      name: nameClean,
      email: emailClean,
      phone: phoneClean,
      date: new Date(date),
      projectType: projectTypeClean,
      requirements: requirementsClean,
      address: addressClean || null,
      budget: budgetClean || null,
      preferredContactTime: preferredContactTimeClean || null,
      status: 'pending',
      createdAt: new Date(),
      source: 'booking_form'
    }).returning();

    return res.status(201).json({ success: true, consultation: result[0] });
  } catch (error) {
    console.error('❌ Consultation booking error:', error);
    return res.status(500).json({ error: 'Failed to book consultation' });
  }
});

// Portfolio endpoints
app.get('/api/portfolio', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const items = await db.select().from(portfolioItems).orderBy(desc(portfolioItems.createdAt));
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

app.post('/api/portfolio', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { title, description, imageUrl, category, featured } = req.body;
    if (!title || !description || !imageUrl || !category) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await db.insert(portfolioItems).values({
      title,
      description,
      imageUrl,
      category,
      featured: featured || false,
      createdAt: new Date()
    }).returning();

    return res.status(201).json(result[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create portfolio item' });
  }
});

app.delete('/api/portfolio/:id', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    await db.delete(portfolioItems).where(sql`id = ${id}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete portfolio item' });
  }
});

// Testimonials endpoints
app.get('/api/testimonials', async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const items = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/testimonials', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { name, role, content, imageUrl } = req.body;
    if (!name || !role || !content || !imageUrl) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await db.insert(testimonials).values({
      name,
      role,
      content,
      imageUrl,
      createdAt: new Date()
    }).returning();

    return res.status(201).json(result[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.delete('/api/testimonials/:id', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    await db.delete(testimonials).where(sql`id = ${id}`);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Consultation Admin endpoints
app.get('/api/consultations', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const items = await db.select().from(consultations).orderBy(desc(consultations.createdAt));
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

app.patch('/api/consultations/:id/status', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.update(consultations)
      .set({ status })
      .where(sql`id = ${id}`)
      .returning();

    return res.status(200).json({ success: true, consultation: result[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

app.patch('/api/consultations/:id/notes', isAdmin, async (req, res) => {
  try {
    if (!db) throw new Error('Database not connected');
    const { id } = req.params;
    const { notes } = req.body;

    const result = await db.update(consultations)
      .set({ notes })
      .where(sql`id = ${id}`)
      .returning();

    return res.status(200).json({ success: true, consultation: result[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notes' });
  }
});

// Handle all other API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint not found: ${req.path}`
  });
});

// Handle 404s
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint not found: ${req.path}`
  });
});

// Global error handler (placed at the bottom of the middleware chain)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
  }
});

export default app;