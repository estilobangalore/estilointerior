// Development server with API handling
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiHandler from './api/index.js';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, 'dist/public');
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  const app = express();
  
  // Enable CORS for all routes
  app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
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
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', environment: isDev ? 'development' : 'production' });
  });
  
  // Handle all API routes
  app.all('/api/*', async (req, res) => {
    try {
      // Pass the request to our consolidated API handler
      console.log('Forwarding API request to handler:', req.method, req.url);
      
      // Fix the URL format for the API handler
      const originalUrl = req.url;
      req.url = originalUrl.replace(/\?.*$/, ''); // Remove query parameters for routing
      
      await apiHandler(req, res);
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
    // In development, create a Vite server for HMR
    const vite = await createViteServer({
      server: { middlewareMode: true },
      root: './client',
      appType: 'spa',
    });
    
    // Use Vite's connect instance as middleware
    app.use(vite.middlewares);
  } else {
    // In production, serve static files
    app.use(express.static(PUBLIC_DIR));
    
    // For any route that doesn't match an API route or static file,
    // serve the SPA index.html to handle client-side routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    });
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
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${isDev ? 'development' : 'production'}`);
    
    if (!isDev) {
      try {
        console.log('Files in public directory:');
        const fs = require('fs');
        const files = fs.readdirSync(PUBLIC_DIR);
        console.log(files);
      } catch (error) {
        console.error('Error listing directory:', error);
      }
    }
  });
  
  return app;
}

// For Vercel serverless deployment - export the Express app
export const app = startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Start server if running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
