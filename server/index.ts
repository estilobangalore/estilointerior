// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupDatabase } from "./setupDb";
import { handleError } from './errors';
import { db } from './db';
import cors from 'cors';
import { setupErrorHandling } from "./errors";
import config from "./config";

// Log environment variables for debugging
console.log('Environment variables loaded:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set (value hidden)' : 'Not set');
console.log('- PORT:', process.env.PORT || '3001 (default)');

const app = express();

// Add CORS middleware with proper configuration
app.use(cors({
  origin: '*', // Allow requests from any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  // Use response event to log API calls
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Set up the database if needed
  try {
    await setupDatabase();
  } catch (error) {
    console.error('Failed to set up database:', error);
    // Continue execution even if database setup fails
    console.log('Continuing with memory storage...');
  }

  const server = await registerRoutes(app);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error in middleware:', err);
    res.status(500).json({ 
      error: err.name || 'Error', 
      message: err.message || 'An unexpected error occurred' 
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Setup error handling
  setupErrorHandling(app);

  // Start the server
  // Force port 3001 regardless of environment variables
  const port = 3001; // parseInt(config.PORT, 10);
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();
