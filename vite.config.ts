import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type extensions for the request object
interface ExtendedIncomingMessage extends IncomingMessage {
  body?: any;
  method?: string;
}

// Create a Vite plugin for mocking API endpoints
function mockApiPlugin(): Plugin {
  // Mock API responses for development
  const mockAPIResponses: Record<string, (req: ExtendedIncomingMessage) => { status: number, body: any }> = {
    '/api/contact': (req) => {
      console.log('Mock contact API received:', req.body);
      return {
        status: 201,
        body: { success: true, message: 'Message sent successfully' }
      };
    },
    
    '/api/consultations': (req) => {
      console.log('Mock consultation API received:', req.body);
      return {
        status: 201,
        body: { 
          success: true, 
          consultation: { 
            id: Math.floor(Math.random() * 1000), 
            ...req.body, 
            createdAt: new Date().toISOString()
          } 
        }
      };
    },
    
    '/api/portfolio': () => {
      return {
        status: 200,
        body: [
          { id: 1, title: 'Modern Living Room', description: 'Contemporary design with natural elements', imageUrl: '/portfolio1.jpg', category: 'Living Room', featured: true },
          { id: 2, title: 'Elegant Kitchen', description: 'Functional and stylish kitchen design', imageUrl: '/portfolio2.jpg', category: 'Kitchen', featured: false }
        ]
      };
    },
    
    '/api/testimonials': () => {
      return {
        status: 200,
        body: [
          { id: 1, name: 'John Doe', role: 'Homeowner', content: 'Fantastic service!', imageUrl: '/person1.jpg' },
          { id: 2, name: 'Jane Smith', role: 'Office Manager', content: 'Amazing redesign of our workspace!', imageUrl: '/person2.jpg' }
        ]
      };
    }
  };

  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req: ExtendedIncomingMessage, res: ServerResponse, next: () => void) => {
        // Only handle API requests
        const url = req.url;
        if (!url || !url.startsWith('/api')) {
          return next();
        }
        
        // Extract the API endpoint without query parameters
        const endpoint = url.replace(/\?.*$/, '');
        console.log(`Mock API request: ${req.method} ${endpoint}`);
        
        // Find the mock handler for this endpoint
        const mockHandler = mockAPIResponses[endpoint];
        const method = req.method || 'GET';
        
        if (mockHandler && method === 'POST') {
          // Parse the request body for POST requests
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              const response = mockHandler(req);
              
              // Send the mock response
              res.statusCode = response.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(response.body));
              console.log(`Mock API response for ${endpoint}:`, response.body);
            } catch (error: any) {
              console.error('Error in mock API:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: 'Internal Server Error', 
                message: error?.message || 'Unknown error'
              }));
            }
          });
          return; // Don't call next()
        } else if (mockHandler && method === 'GET') {
          // Handle GET requests
          try {
            const response = mockHandler(req);
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(response.body));
            console.log(`Mock API response for ${endpoint}:`, response.body);
          } catch (error: any) {
            console.error('Error in mock API:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: 'Internal Server Error', 
              message: error?.message || 'Unknown error'
            }));
          }
          return; // Don't call next()
        }
        
        // If no handler found, return a 404
        console.log(`No mock handler for ${endpoint}`);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found', message: 'API endpoint not found' }));
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    mockApiPlugin()
  ],
  root: "./client",
  publicDir: "./client/public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  build: {
    outDir: "dist/public",
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    port: 5173,
    host: true
  }
});
