import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock API responses for development
const mockAPIResponses = {
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

export default defineConfig({
  plugins: [react()],
  root: "./client",
  publicDir: "./client/public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from:', req.url, proxyRes.statusCode);
          });
        },
      }
    },
    port: 5173,
    host: true,
    // Add middleware for mock API responses in development
    middlewares: [
      (req, res, next) => {
        // Only handle API requests
        if (!req.url || !req.url.startsWith('/api')) {
          return next();
        }
        
        // Extract the API endpoint without query parameters
        const endpoint = req.url.replace(/\?.*$/, '');
        console.log(`Mock API request: ${req.method} ${endpoint}`);
        
        // Find the mock handler for this endpoint
        const mockHandler = mockAPIResponses[endpoint];
        if (mockHandler && req.method === 'POST') {
          // Parse the request body for POST requests
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          
          req.on('end', () => {
            try {
              req.body = body ? JSON.parse(body) : {};
              const response = mockHandler(req);
              
              // Send the mock response
              res.writeHead(response.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(response.body));
              console.log(`Mock API response for ${endpoint}:`, response.body);
            } catch (error) {
              console.error('Error in mock API:', error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
            }
          });
        } else if (mockHandler && req.method === 'GET') {
          // Handle GET requests
          try {
            const response = mockHandler(req);
            res.writeHead(response.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response.body));
            console.log(`Mock API response for ${endpoint}:`, response.body);
          } catch (error) {
            console.error('Error in mock API:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
          }
        } else {
          // Pass through to the next middleware
          next();
        }
      }
    ]
  }
});
