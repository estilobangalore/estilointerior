import { db } from '../lib/db';
import { portfolioItems } from '../lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    } else if (path.startsWith('/portfolio')) {
      return await portfolioHandler(req, res, path);
    } else if (path.startsWith('/testimonials')) {
      return await testimonialsHandler(req, res, path);
    } else if (path.startsWith('/consultations')) {
      return await consultationsHandler(req, res, path);
    } else if (path.startsWith('/auth')) {
      return await authHandler(req, res, path);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
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

// Add other handlers (testimonials, consultations, auth)
async function testimonialsHandler(req, res, path) {
  // Similar implementation as portfolio handler
  res.status(501).json({ error: 'Not implemented yet' });
}

async function consultationsHandler(req, res, path) {
  // Similar implementation as portfolio handler
  res.status(501).json({ error: 'Not implemented yet' });
}

async function authHandler(req, res, path) {
  // Authentication handler
  res.status(501).json({ error: 'Not implemented yet' });
}
