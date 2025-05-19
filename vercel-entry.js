// Custom entry point for Vercel deployment
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';

// Set up a minimal working express app
const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Database functionality will not work.');
}

// Create database client
const client = postgres(connectionString || '', { 
  ssl: { require: true, rejectUnauthorized: false },
  max: 1,
  idle_timeout: 20,
  connect_timeout: 30
});

// Create database instance
const db = drizzle(client, { schema });

// Add basic request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    version: '1.0.2'
  });
});

// Add a contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    console.log('Contact form data:', req.body);
    
    // Simple validation
    if (!req.body.name || !req.body.email || !req.body.message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide name, email, and message'
      });
    }
    
    // Save as a consultation
    const result = await db.insert(schema.consultations).values({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || 'Not provided',
      date: new Date(),
      projectType: 'Contact Form Message',
      requirements: req.body.message,
      status: 'pending',
      source: 'contact_form',
      address: req.body.address
    }).returning();

    return res.status(201).json({
      success: true,
      message: 'Message received successfully',
      consultation: result[0]
    });
  } catch (error) {
    console.error('Error handling contact form:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'There was an error processing your request'
    });
  }
});

// Add a consultation form endpoint
app.post('/api/consultations', async (req, res) => {
  try {
    console.log('Consultation form data:', req.body);
    
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
    
    // Save the consultation
    const result = await db.insert(schema.consultations).values({
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

    return res.status(201).json({
      success: true,
      message: 'Consultation request received successfully',
      consultation: result[0]
    });
  } catch (error) {
    console.error('Error handling consultation form:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'There was an error processing your request'
    });
  }
});

// Default route handler
app.get('*', (req, res) => {
  // For API requests that don't match a handler
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Not Found',
      message: `API endpoint not found: ${req.path}`
    });
  }
  
  // For all other requests, return a simple HTML page
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
      </ul>
      <p>The frontend application should be deployed separately.</p>
    </body>
    </html>
  `);
});

export { app }; 