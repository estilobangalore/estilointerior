import { db } from '../lib/db';
import { portfolioItems, testimonials, consultations, users } from '../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' 
    ? 'https://your-vercel-domain.vercel.app' 
    : '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the path from the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, '');
  
  // Route to the appropriate handler
  try {
    if (path === '/test-db') {
      return await testDbHandler(req, res);
    } else if (path === '/debug') {
      return await debugHandler(req, res);
    } else if (path === '/login') {
      return await loginHandler(req, res);
    } else if (path === '/logout') {
      return await logoutHandler(req, res);
    } else if (path === '/user') {
      return await userHandler(req, res);
    } else if (path === '/register') {
      return await registerHandler(req, res);
    } else if (path.startsWith('/portfolio')) {
      return await portfolioHandler(req, res, path);
    } else if (path.startsWith('/testimonials')) {
      return await testimonialsHandler(req, res, path);
    } else if (path.startsWith('/consultations')) {
      return await consultationsHandler(req, res, path);
    } else if (path === '/ping') {
      res.status(200).json({ 
        status: 'ok', 
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
      return;
    } else {
      res.status(404).json({ error: 'Not found', path });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Login handler
async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
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
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Login failed: ' + (error.message || 'Unknown error') 
    });
  }
}

// User info handler
async function userHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // This is a placeholder for real session-based authentication
  // In a real app, you would validate the session cookie
  // For now, we'll just return a mock admin user
  
  try {
    // Get first admin user for demo purposes
    const adminUsers = await db.select().from(users).where(eq(users.isAdmin, true));
    const user = adminUsers[0];

    if (user) {
      // Return user without password
      return res.status(200).json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      });
    } else {
      // No user found - return unauthorized
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    console.error('User info error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Logout handler
async function logoutHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // In a real app, you would invalidate the session
  // For this demo, we'll just send a success response
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
}

// Registration handler
async function registerHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password, isAdmin } = req.body;

  try {
    // Check if username already exists
    const existingUsers = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // In a real app, you would hash the password with bcrypt
    // Create the user
    const result = await db.insert(users).values({
      username,
      password, // In a real app, this would be a hashed password
      isAdmin: isAdmin || false
    }).returning();

    const user = result[0];

    // Return user without password
    return res.status(201).json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
}

// Database test handler
async function testDbHandler(req, res) {
  try {
    // Attempt a simple query
    const result = await db.execute('SELECT 1 as test');
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      result: result,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
}

// Debug handler
function debugHandler(req, res) {
  try {
    // Include environment info (but NOT sensitive data)
    const debugInfo = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({ 
      status: 'ok',
      message: 'Debug endpoint working',
      info: debugInfo
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

// Portfolio handler
async function portfolioHandler(req, res, path) {
  // Extract ID if present in the path (format: /portfolio/123)
  const segments = path.split('/').filter(Boolean);
  const id = segments.length > 1 ? parseInt(segments[1]) : null;
  
  if (!id) {
    // Handle collection requests (/portfolio)
    if (req.method === 'GET') {
      try {
        const allPortfolioItems = await db.select().from(portfolioItems);
        res.status(200).json(allPortfolioItems);
      } catch (error) {
        console.error('Error fetching portfolio items:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio items' });
      }
    } else if (req.method === 'POST') {
      // Add POST handler for creating items
      try {
        const result = await db.insert(portfolioItems).values(req.body).returning();
        res.status(201).json(result[0]);
      } catch (error) {
        console.error('Error creating portfolio item:', error);
        res.status(500).json({ error: 'Failed to create portfolio item' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    // Handle individual item requests (/portfolio/123)
    if (req.method === 'GET') {
      try {
        const item = await db
          .select()
          .from(portfolioItems)
          .where(eq(portfolioItems.id, id))
          .limit(1);
        
        if (item.length === 0) {
          return res.status(404).json({ error: 'Portfolio item not found' });
        }
        
        res.status(200).json(item[0]);
      } catch (error) {
        console.error('Error fetching portfolio item:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio item' });
      }
    } else if (req.method === 'PATCH') {
      try {
        const result = await db
          .update(portfolioItems)
          .set(req.body)
          .where(eq(portfolioItems.id, id))
          .returning();
        
        if (result.length === 0) {
          return res.status(404).json({ error: 'Portfolio item not found' });
        }
        
        res.status(200).json(result[0]);
      } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({ error: 'Failed to update portfolio item' });
      }
    } else if (req.method === 'DELETE') {
      try {
        const result = await db
          .delete(portfolioItems)
          .where(eq(portfolioItems.id, id))
          .returning();
        
        if (result.length === 0) {
          return res.status(404).json({ error: 'Portfolio item not found' });
        }
        
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting portfolio item:', error);
        res.status(500).json({ error: 'Failed to delete portfolio item' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

// Testimonials handler
async function testimonialsHandler(req, res, path) {
  const segments = path.split('/').filter(Boolean);
  const id = segments.length > 1 ? parseInt(segments[1]) : null;
  
  if (!id) {
    // Handle collection requests (/testimonials)
    if (req.method === 'GET') {
      try {
        const allTestimonials = await db.select().from(testimonials);
        res.status(200).json(allTestimonials);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
      }
    } else if (req.method === 'POST') {
      try {
        const result = await db.insert(testimonials).values(req.body).returning();
        res.status(201).json(result[0]);
      } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ error: 'Failed to create testimonial' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    // Handle individual item requests (/testimonials/123)
    if (req.method === 'DELETE') {
      try {
        const result = await db
          .delete(testimonials)
          .where(eq(testimonials.id, id))
          .returning();
        
        if (result.length === 0) {
          return res.status(404).json({ error: 'Testimonial not found' });
        }
        
        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        res.status(500).json({ error: 'Failed to delete testimonial' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
}

// Consultations handler
async function consultationsHandler(req, res, path) {
  const segments = path.split('/').filter(Boolean);
  const id = segments.length > 1 ? parseInt(segments[1]) : null;
  
  if (!id) {
    // Handle collection requests (/consultations)
    if (req.method === 'GET') {
      try {
        const allConsultations = await db.select().from(consultations);
        res.status(200).json(allConsultations);
      } catch (error) {
        console.error('Error fetching consultations:', error);
        res.status(500).json({ error: 'Failed to fetch consultations' });
      }
    } else if (req.method === 'POST') {
      try {
        const result = await db.insert(consultations).values(req.body).returning();
        res.status(201).json(result[0]);
      } catch (error) {
        console.error('Error creating consultation:', error);
        res.status(500).json({ error: 'Failed to create consultation' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } else {
    // Handle individual item requests (/consultations/123)
    if (req.method === 'PATCH') {
      try {
        const result = await db
          .update(consultations)
          .set(req.body)
          .where(eq(consultations.id, id))
          .returning();
        
        if (result.length === 0) {
          return res.status(404).json({ error: 'Consultation not found' });
        }
        
        res.status(200).json(result[0]);
      } catch (error) {
        console.error('Error updating consultation:', error);
        res.status(500).json({ error: 'Failed to update consultation' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
}
