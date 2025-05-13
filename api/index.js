import { db } from '../lib/db';
import { portfolioItems, testimonials, consultations, users } from '../lib/schema';
import { eq, sql } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Add request logging
  console.log('API request to:', req.url, 'Method:', req.method);

  // Get the path from the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, '');
  
  // Route to the appropriate handler
  try {
    if (path === '/ping') {
      return pingHandler(req, res);
    } else if (path === '/test-db') {
      return await testDbHandler(req, res);
    } else if (path === '/list-users') {
      return await listUsersHandler(req, res);
    } else if (path === '/debug') {
      return debugHandler(req, res);
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
    } else {
      res.status(404).json({ error: 'Not found', path });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Simple ping test
function pingHandler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
}

// Database test handler
async function testDbHandler(req, res) {
  try {
    // Log database URL format (not the actual value for security)
    const dbUrl = process.env.DATABASE_URL;
    console.log('Database URL is set:', !!dbUrl);
    if (dbUrl) {
      console.log('Database URL format check:');
      console.log('- Starts with postgres:// or postgresql://', 
        dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'));
      console.log('- Contains @ symbol:', dbUrl.includes('@'));
      console.log('- URL length:', dbUrl.length);
    }

    // Attempt a simple query
    console.log('Attempting simple query...');
    const result = await db.execute('SELECT 1 as test');
    console.log('Query executed successfully');
    
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      result: result,
      hasDbUrl: !!process.env.DATABASE_URL
    });
  } catch (error) {
    console.error('Database connection error details:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed',
      error: error.message,
      errorType: error.constructor.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// List users handler
async function listUsersHandler(req, res) {
  try {
    // Attempt to query users with basic SQL
    const result = await db.execute('SELECT id, username, is_admin FROM users');
    
    res.status(200).json({ 
      success: true, 
      message: 'Users retrieved successfully',
      count: result.length,
      users: result.map(u => ({ id: u.id, username: u.username, isAdmin: u.is_admin }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
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

// Login handler
async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Parse request body if needed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      console.error('Error parsing request body:', e);
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
  }

  const { username, password } = body;
  console.log('Login attempt for username:', username);

  try {
    // Use a direct SQL query instead of the ORM
    console.log('Querying database for user directly');
    const rawResult = await db.execute(`
      SELECT id, username, password, is_admin 
      FROM users 
      WHERE username = '${username}'
    `);
    
    console.log('Query result:', rawResult);
    
    if (!rawResult || rawResult.length === 0) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = rawResult[0];

    if (password !== user.password) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create a simplified user object without the password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin
    };

    console.log('Login successful for user:', user.username);
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Login failed: ' + (error.message || 'Unknown error'),
      error: error.toString()
    });
  }
}

// User info handler
async function userHandler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get admin user for demo purposes
    const adminUsers = await db.execute(`
      SELECT id, username, is_admin 
      FROM users 
      WHERE is_admin = true 
      LIMIT 1
    `);
    
    if (adminUsers && adminUsers.length > 0) {
      const user = adminUsers[0];
      // Return user without password
      return res.status(200).json({
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin
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
    const existingUsers = await db.execute(`
      SELECT id FROM users WHERE username = '${username}'
    `);
    
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create the user
    const result = await db.execute(`
      INSERT INTO users (username, password, is_admin)
      VALUES ('${username}', '${password}', ${isAdmin || false})
      RETURNING id, username, is_admin
    `);

    if (!result || result.length === 0) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const user = result[0];

    // Return user without password
    return res.status(201).json({
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create user: ' + error.message });
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
        const allPortfolioItems = await db.execute(`
          SELECT * FROM portfolio_items ORDER BY created_at DESC
        `);
        res.status(200).json(allPortfolioItems);
      } catch (error) {
        console.error('Error fetching portfolio items:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio items' });
      }
    } else if (req.method === 'POST') {
      try {
        const { title, description, imageUrl, category, featured } = req.body;
        const result = await db.execute(`
          INSERT INTO portfolio_items (title, description, image_url, category, featured)
          VALUES ('${title}', '${description}', '${imageUrl}', '${category}', ${featured || false})
          RETURNING *
        `);
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
        const result = await db.execute(`
          SELECT * FROM portfolio_items WHERE id = ${id}
        `);
        
        if (!result || result.length === 0) {
          return res.status(404).json({ error: 'Portfolio item not found' });
        }
        
        res.status(200).json(result[0]);
      } catch (error) {
        console.error('Error fetching portfolio item:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio item' });
      }
    } else if (req.method === 'PATCH') {
      try {
        const updateFields = [];
        const body = req.body;
        
        if (body.title !== undefined) updateFields.push(`title = '${body.title}'`);
        if (body.description !== undefined) updateFields.push(`description = '${body.description}'`);
        if (body.imageUrl !== undefined) updateFields.push(`image_url = '${body.imageUrl}'`);
        if (body.category !== undefined) updateFields.push(`category = '${body.category}'`);
        if (body.featured !== undefined) updateFields.push(`featured = ${body.featured}`);
        
        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }
        
        const result = await db.execute(`
          UPDATE portfolio_items
          SET ${updateFields.join(', ')}
          WHERE id = ${id}
          RETURNING *
        `);
        
        if (!result || result.length === 0) {
          return res.status(404).json({ error: 'Portfolio item not found' });
        }
        
        res.status(200).json(result[0]);
      } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({ error: 'Failed to update portfolio item' });
      }
    } else if (req.method === 'DELETE') {
      try {
        const result = await db.execute(`
          DELETE FROM portfolio_items
          WHERE id = ${id}
          RETURNING id
        `);
        
        if (!result || result.length === 0) {
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
        const allTestimonials = await db.execute(`
          SELECT * FROM testimonials ORDER BY created_at DESC
        `);
        res.status(200).json(allTestimonials);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ error: 'Failed to fetch testimonials' });
      }
    } else if (req.method === 'POST') {
      try {
        const { name, role, content, imageUrl } = req.body;
        const result = await db.execute(`
          INSERT INTO testimonials (name, role, content, image_url)
          VALUES ('${name}', '${role}', '${content}', '${imageUrl}')
          RETURNING *
        `);
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
        const result = await db.execute(`
          DELETE FROM testimonials
          WHERE id = ${id}
          RETURNING id
        `);
        
        if (!result || result.length === 0) {
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
        const allConsultations = await db.execute(`
          SELECT * FROM consultations ORDER BY created_at DESC
        `);
        res.status(200).json(allConsultations);
      } catch (error) {
        console.error('Error fetching consultations:', error);
        res.status(500).json({ error: 'Failed to fetch consultations' });
      }
    } else if (req.method === 'POST') {
      try {
        const { name, email, phone, date, projectType, requirements, address, budget, preferredContactTime } = req.body;
        
        // Validate required fields
        if (!name || !email || !phone || !date || !projectType || !requirements) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const result = await db.execute(`
          INSERT INTO consultations 
          (name, email, phone, date, project_type, requirements, address, budget, preferred_contact_time)
          VALUES (
            '${name}', 
            '${email}', 
            '${phone}', 
            '${date}', 
            '${projectType}', 
            '${requirements}', 
            ${address ? `'${address}'` : 'NULL'}, 
            ${budget ? `'${budget}'` : 'NULL'}, 
            ${preferredContactTime ? `'${preferredContactTime}'` : 'NULL'}
          )
          RETURNING *
        `);
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
        const updateFields = [];
        const body = req.body;
        
        if (body.status !== undefined) updateFields.push(`status = '${body.status}'`);
        if (body.notes !== undefined) updateFields.push(`notes = '${body.notes}'`);
        
        if (updateFields.length === 0) {
          return res.status(400).json({ error: 'No fields to update' });
        }
        
        const result = await db.execute(`
          UPDATE consultations
          SET ${updateFields.join(', ')}
          WHERE id = ${id}
          RETURNING *
        `);
        
        if (!result || result.length === 0) {
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
