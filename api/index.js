// Import from mock db in development or real db in production
import { db as mockDb } from '../lib/mock-db.js';
import { db as realDb } from '../server/db.js';
import { portfolioItems, testimonials, consultations, users } from '../lib/schema.js';
import { eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Choose the appropriate database based on environment
// For testing, always log which database we're using
const isProduction = process.env.NODE_ENV === 'production';
const db = isProduction ? realDb : mockDb;
console.log(`Using ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} database`);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the route from the URL path
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Skip 'api' if present in the path
  const startIndex = pathParts[0] === 'api' ? 1 : 0;
  const mainRoute = pathParts[startIndex] || '';
  const subRoute = pathParts[startIndex + 1] || '';
  
  console.log(`API Request: ${req.method} ${url.pathname}`);
  console.log(`Main route: "${mainRoute}", Sub route: "${subRoute}"`);

  // Log full request details in development
  if (!isProduction) {
    console.log('Request body:', req.body);
  }

  try {
    // Special handling for auth routes
    if (mainRoute === 'auth') {
      if (subRoute === 'login') {
        if (req.method === 'POST') {
          console.log('Redirecting /api/auth/login to handleLogin');
          return await handleLogin(req, res);
        }
      } else if (subRoute === 'logout') {
        if (req.method === 'POST') {
          console.log('Redirecting /api/auth/logout to handleLogout');
          return await handleLogout(req, res);
        }
      } else if (subRoute === 'register') {
        if (req.method === 'POST') {
          console.log('Redirecting /api/auth/registr to handleRegister');
          return await handleRegister(req, res);
        }
      } else if (subRoute === 'user') {
        if (req.method === 'GET') {
          console.log('Redirecting /api/auth/user to handleGetUser');
          return await handleGetUser(req, res);
        }
      }
      // If we get here, no matching auth route was found
      return res.status(404).json({ error: 'Auth endpoint not found' });
    }

    // Route to the appropriate handler based on the path
    switch (mainRoute) {
      case 'contact':
        if (req.method === 'POST') {
          console.log('Handling contact form submission');
          return await handleContact(req, res);
        }
        break;
      
      case 'consultations':
        if (req.method === 'POST') {
          console.log('Handling consultation form submission');
          return await handleConsultations(req, res);
        }
        break;
        
      case 'portfolio':
        console.log('Handling portfolio request');
        return await handlePortfolio(req, res);
        
      case 'testimonials':
        console.log('Handling testimonials request');
        return await handleTestimonials(req, res);
        
      // Add fallback routes for legacy endpoints
      case 'login':
        if (req.method === 'POST') {
          console.log('Handling login request directly');
          return await handleLogin(req, res);
        }
        break;
        
      case 'logout':
        if (req.method === 'POST') {
          console.log('Handling logout request directly');
          return await handleLogout(req, res);
        }
        break;
        
      case 'register':
        if (req.method === 'POST') {
          console.log('Handling register request directly');
          return await handleRegister(req, res);
        }
        break;
        
      case 'user':
        if (req.method === 'GET') {
          console.log('Handling get user request directly');
          return await handleGetUser(req, res);
        }
        break;
        
      default:
        console.log(`API route not found: ${mainRoute}`);
        return res.status(404).json({ error: 'API route not found', path: mainRoute });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }

  console.log(`Method not allowed: ${req.method} for route ${mainRoute}`);
  return res.status(405).json({ error: 'Method not allowed', method: req.method, route: mainRoute });
}

// ======================
// AUTH HANDLERS
// ======================

// Handle auth routes
async function handleAuth(subRoute, req, res) {
  switch (subRoute) {
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
      return res.status(404).json({ error: 'Auth route not found' });
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

    // Check for plain text password (development) or hash (production)
    let passwordMatch = false;
    
    // First try direct comparison (development mode)
    if (password === user.password) {
      passwordMatch = true;
    } 
    // Then try hash comparison (production mode with seed-admin.js)
    else if (username === 'admin') {
      // Simple SHA-256 hash check to match seed-admin.js
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      passwordMatch = (hashedPassword === user.password);
    }
    
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
    
    console.log(`Login successful for user: ${username}, isAdmin: ${user.isAdmin}`);
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

// ======================
// CONTENT HANDLERS
// ======================

// Handle content routes
async function handleContent(subRoute, req, res) {
  switch (subRoute) {
    case 'portfolio':
      return await handlePortfolio(req, res);
    case 'testimonials':
      return await handleTestimonials(req, res);
    case 'contact':
      if (req.method === 'POST') {
        return await handleContact(req, res);
      }
      break;
    case 'consultations':
      if (req.method === 'POST') {
        return await handleConsultations(req, res);
      }
      break;
    default:
      return res.status(404).json({ error: 'Content route not found' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Portfolio items handler
async function handlePortfolio(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all portfolio items
      const items = await db.select().from(portfolioItems);
      return res.status(200).json(items);
    } else if (req.method === 'POST') {
      // Create a new portfolio item
      const { title, description, imageUrl, category, featured } = req.body;
      
      if (!title || !description || !imageUrl || !category) {
        return res.status(400).json({ error: 'Required fields missing' });
      }
      
      const result = await db.insert(portfolioItems).values({
        title,
        description,
        imageUrl,
        category,
        featured: featured || false
      }).returning();
      
      return res.status(201).json(result[0]);
    } else if (req.method === 'PUT') {
      // Update portfolio item
      const { id, title, description, imageUrl, category, featured } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' });
      }
      
      const result = await db.update(portfolioItems)
        .set({
          title,
          description,
          imageUrl,
          category,
          featured
        })
        .where(eq(portfolioItems.id, id))
        .returning();
      
      return res.status(200).json(result[0]);
    } else if (req.method === 'DELETE') {
      // Delete portfolio item
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Item ID is required' });
      }
      
      await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
      
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Portfolio error:', error);
    return res.status(500).json({ 
      error: 'Operation failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
}

// Testimonials handler
async function handleTestimonials(req, res) {
  try {
    if (req.method === 'GET') {
      // Get all testimonials
      const items = await db.select().from(testimonials);
      return res.status(200).json(items);
    } else if (req.method === 'POST') {
      // Create a new testimonial
      const { name, role, content, imageUrl } = req.body;
      
      if (!name || !role || !content) {
        return res.status(400).json({ error: 'Required fields missing' });
      }
      
      const result = await db.insert(testimonials).values({
        name,
        role,
        content,
        imageUrl: imageUrl || '/placeholder.jpg'
      }).returning();
      
      return res.status(201).json(result[0]);
    } else if (req.method === 'PUT') {
      // Update testimonial
      const { id, name, role, content, imageUrl } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Testimonial ID is required' });
      }
      
      const result = await db.update(testimonials)
        .set({
          name,
          role,
          content,
          imageUrl
        })
        .where(eq(testimonials.id, id))
        .returning();
      
      return res.status(200).json(result[0]);
    } else if (req.method === 'DELETE') {
      // Delete testimonial
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Testimonial ID is required' });
      }
      
      await db.delete(testimonials).where(eq(testimonials.id, id));
      
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Testimonials error:', error);
    return res.status(500).json({ 
      error: 'Operation failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
}

// Contact form handler
async function handleContact(req, res) {
  console.log('Contact form received data:', JSON.stringify(req.body, null, 2));
  
  try {
    // Extract data from request body with fallbacks
    const { 
      name = '', 
      email = '', 
      message = '', 
      phone = 'Not provided',
      address = null 
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      console.error('Missing required fields in contact form submission');
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide name, email, and message',
        missing: [
          !name ? 'name' : null,
          !email ? 'email' : null,
          !message ? 'message' : null
        ].filter(Boolean)
      });
    }

    // Log the data we're about to insert
    console.log('Preparing to insert contact form data:', {
      name,
      email,
      phone,
      message,
      address
    });
    
    try {
      // Check database connection before attempting insert
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      // Check if consultations table is accessible
      console.log('Attempting to access consultations table...');
      
      // Save as a consultation with minimal data
      const result = await db.insert(consultations).values({
        name,
        email,
        phone,
        date: new Date(),
        projectType: 'Contact Form Message',
        requirements: message, // Make sure this matches what the schema expects
        status: 'pending',
        source: 'contact_form',
        address
      }).returning();

      console.log('Contact message saved successfully:', result);
      return res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (dbError) {
      console.error('Database error when saving contact form:', dbError);
      console.error('Database error details:', dbError.stack);
      
      // Check for specific database error types
      let errorMessage = 'There was an error saving your message to our database';
      let errorDetails = dbError.message;
      
      // Check for connection issues
      if (dbError.message?.includes('connect')) {
        errorMessage = 'Unable to connect to the database. Please try again later.';
      } 
      // Check for schema/column issues
      else if (dbError.message?.includes('column') || dbError.message?.includes('schema')) {
        errorMessage = 'There was a data format issue. Our team has been notified.';
      }
      
      return res.status(500).json({ 
        error: 'Database error', 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }
  } catch (error) {
    console.error('Error submitting contact form:', error);
    console.error('Error details:', error.stack);
    
    // Send a more detailed error response
    return res.status(500).json({ 
      error: 'Failed to send message', 
      message: 'A server error has occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Consultations handler
async function handleConsultations(req, res) {
  console.log('Consultation form received data:', JSON.stringify(req.body, null, 2));
  
  try {
    // Extract data from request body
    const { 
      name, 
      email, 
      phone, 
      date,
      projectType,
      requirements,
      address = null,
      budget = null,
      preferredContactTime = null
    } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !requirements) {
      console.error('Missing required fields in consultation form submission');
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please provide all required information',
        missing: [
          !name ? 'name' : null,
          !email ? 'email' : null,
          !phone ? 'phone' : null,
          !requirements ? 'requirements' : null
        ].filter(Boolean)
      });
    }

    // Validate date format
    let formattedDate;
    try {
      formattedDate = new Date(date);
      if (isNaN(formattedDate.getTime())) {
        console.error('Invalid date format provided:', date);
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'Please provide a valid date',
          providedDate: date
        });
      }
    } catch (dateError) {
      console.error('Error parsing date:', dateError);
      return res.status(400).json({
        error: 'Invalid date',
        message: 'Please provide a valid date format',
        providedDate: date
      });
    }

    try {
      // Check database connection before attempting insert
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      console.log('Attempting to save consultation with date:', formattedDate.toISOString());
      
      // Save the consultation
      const result = await db.insert(consultations).values({
        name,
        email,
        phone,
        date: formattedDate,
        projectType,
        requirements,
        status: 'pending',
        source: 'website',
        address,
        budget,
        preferredContactTime
      }).returning();

      console.log('Consultation saved successfully:', result);
      return res.status(201).json({ success: true, consultation: result[0] });
    } catch (dbError) {
      console.error('Database error when saving consultation:', dbError);
      console.error('Database error details:', dbError.stack);
      
      // Check for specific database error types
      let errorMessage = 'There was an error saving your consultation to our database';
      let errorDetails = dbError.message;
      
      // Check for connection issues
      if (dbError.message?.includes('connect')) {
        errorMessage = 'Unable to connect to the database. Please try again later.';
      } 
      // Check for schema/column issues
      else if (dbError.message?.includes('column') || dbError.message?.includes('schema')) {
        errorMessage = 'There was a data format issue. Our team has been notified.';
      }
      
      return res.status(500).json({ 
        error: 'Database error', 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      });
    }
  } catch (error) {
    console.error('Error submitting consultation:', error);
    console.error('Error details:', error.stack);
    
    return res.status(500).json({ 
      error: 'Failed to submit consultation request',
      message: 'A server error has occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
