// Development server with API handling
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiHandler from './api/index.js';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, 'dist/public');
const isDev = process.env.NODE_ENV !== 'production';

console.log('[server] Initializing server...');
console.log('[server] Environment:', process.env.NODE_ENV);
console.log('[server] Database URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set');

// Create a simple health check endpoint handler
const healthHandler = (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    environment: isDev ? 'development' : 'production',
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
};

async function startServer() {
  const app = express();
  
  // Enable CORS for all routes
  app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: [
      'Content-Type', 
      'Authorization',
      'X-CSRF-Token', 
      'X-Requested-With', 
      'Accept', 
      'Accept-Version', 
      'Content-Length', 
      'Content-MD5', 
      'Date', 
      'X-Api-Version'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type']
  }));
  
  // Parse JSON request bodies
  app.use(express.json());
  
  // Add request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    // Log request body for POST/PUT requests
    if (['POST', 'PUT'].includes(req.method) && req.body) {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
  });
  
  // Health check endpoint for Vercel
  app.get('/api/health', healthHandler);
  
  // Handle API routes
  app.use('/api', (req, res, next) => {
    try {
      // Pass the request to our consolidated API handler
      console.log('Forwarding API request to handler:', req.method, req.url);
      apiHandler(req, res).catch(error => {
        console.error('API request error:', error);
        res.status(500).json({
          error: 'Internal Server Error',
          message: isDev ? error.message : 'Something went wrong',
          stack: isDev ? error.stack : undefined
        });
      });
    } catch (error) {
      console.error('API request error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: isDev ? error.message : 'Something went wrong',
        stack: isDev ? error.stack : undefined
      });
    }
  });
  
  if (isDev) {
    try {
      // In development, create a Vite server for HMR
      const vite = await createViteServer({
        server: { middlewareMode: true },
        root: './client',
        appType: 'spa',
      });
      
      // Use Vite's connect instance as middleware
      app.use(vite.middlewares);
    } catch (error) {
      console.error('Failed to initialize Vite server:', error);
      // Fallback to serving static files if Vite initialization fails
      app.use(express.static(PUBLIC_DIR));
      app.get('*', (req, res) => {
        res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
      });
    }
  } else {
    // In production, serve static files
    try {
      if (fs.existsSync(PUBLIC_DIR)) {
        console.log('Serving static files from:', PUBLIC_DIR);
        app.use(express.static(PUBLIC_DIR));
        
        // For any route that doesn't match an API route or static file,
        // serve the SPA index.html to handle client-side routing
        app.get('*', (req, res) => {
          const indexPath = path.join(PUBLIC_DIR, 'index.html');
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.send('<html><body><h1>Application Error</h1><p>index.html not found</p></body></html>');
          }
        });
      } else {
        console.warn('Public directory not found:', PUBLIC_DIR);
        // Create a minimal response for all routes
        app.get('*', (req, res) => {
          if (req.path.startsWith('/api')) return; // Skip API routes
          res.send('<html><body><h1>Estilo Interior Design</h1><p>API Server Only Mode</p></body></html>');
        });
      }
    } catch (error) {
      console.error('Error setting up static file serving:', error);
      // Create a minimal fallback for all routes
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) return; // Skip API routes
        res.send('<html><body><h1>Service Error</h1><p>Please try again later</p></body></html>');
      });
    }
  }
  
  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: isDev ? err.message : 'Something went wrong',
      stack: isDev ? err.stack : undefined
    });
  });
  
  // Start the server if not imported as a module
  if (import.meta.url === `file://${process.argv[1]}`) {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${isDev ? 'development' : 'production'}`);
      
      if (!isDev) {
        try {
          console.log('Files in public directory:');
          const files = fs.readdirSync(PUBLIC_DIR);
          console.log(files);
        } catch (error) {
          console.error('Error listing directory:', error);
        }
      }
    });
    return server;
  }
  
  return app;
}

// For Vercel serverless deployment - export the Express app
export const app = await startServer().catch(err => {
  console.error('Failed to start server:', err);
  // Return a minimal express app in case of error
  const failureApp = express();
  failureApp.use(cors());
  failureApp.get('*', (req, res) => {
    res.status(500).json({
      error: 'Server Initialization Failed',
      message: err.message,
      stack: isDev ? err.stack : undefined
    });
  });
  return failureApp;
});
