// Development server with HMR and API handling
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiHandler from './api/index.js';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import { setupAuth } from './server/auth.ts';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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
    version: '1.0.6'
  });
};

const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

async function startServer() {
  const app = express();
  
  // Apply helmet security headers
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { message: 'Too many requests, please try again later.' }
  });
  app.use('/api', apiLimiter);

  // Enable CORS
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
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: [
      'Content-Type', 
      'Authorization',
      'Cookie',
      'X-CSRF-Token', 
      'X-Requested-With', 
      'Accept', 
      'Accept-Version', 
      'Content-Length', 
      'Content-MD5', 
      'Date', 
      'X-Api-Version'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type', 'Set-Cookie']
  }));
  
  // Parse JSON request bodies with limits
  app.use(express.json({ limit: '100kb' }));
  
  // Setup session and passport auth
  setupAuth(app);
  
  // Add request logging (excluding passwords)
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  
  // Health check endpoint for Vercel
  app.get('/api/health', healthHandler);
  
  // Handle API routes
  app.use('/api', (req, res, next) => {
    try {
      console.log('Forwarding API request to handler:', req.method, req.url);
      apiHandler(req, res).catch(error => {
        console.error('API request error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal Server Error',
            message: isDev ? error.message : 'Something went wrong',
            stack: isDev ? error.stack : undefined
          });
        }
      });
    } catch (error) {
      console.error('API request error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: isDev ? error.message : 'Something went wrong',
          stack: isDev ? error.stack : undefined
        });
      }
    }
  });
  
  if (isDev) {
    try {
      // In development, create a Vite server for HMR
      const vite = await createViteServer({
        server: { middlewareMode: true },
        configFile: path.resolve(__dirname, 'vite.config.ts'),
        appType: 'spa',
      });
      
      // Use Vite's connect instance as middleware
      app.use(vite.middlewares);
    } catch (error) {
      console.error('Failed to initialize Vite server:', error);
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
        app.get('*', (req, res) => {
          if (req.path.startsWith('/api')) return;
          res.send('<html><body><h1>Estilo Interior Design</h1><p>API Server Only Mode</p></body></html>');
        });
      }
    } catch (error) {
      console.error('Error setting up static file serving:', error);
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) return;
        res.send('<html><body><h1>Service Error</h1><p>Please try again later</p></body></html>');
      });
    }
  }
  
  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: isDev ? err.message : 'Something went wrong',
        stack: isDev ? err.stack : undefined
      });
    }
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
