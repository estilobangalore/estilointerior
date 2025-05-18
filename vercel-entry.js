// Custom entry point for Vercel deployment
// Patches problematic modules before they're loaded
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

// In case everything fails, create a minimal working server
const fallbackApp = express();
fallbackApp.use(cors());
fallbackApp.get('*', (req, res) => {
  res.status(200).json({
    message: 'Fallback server is running. Main application failed to initialize.',
    error: global.serverInitError || 'Unknown error',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set'
    },
    time: new Date().toISOString()
  });
});

let app;

try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  console.log('[vercel-entry] Starting server initialization...');
  console.log('[vercel-entry] Environment:', process.env.NODE_ENV);
  
  // Create the dist/public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'dist/public');
  if (!fs.existsSync(publicDir)) {
    console.log('[vercel-entry] Creating dist/public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
    
    // Create a basic index.html file
    fs.writeFileSync(path.join(publicDir, 'index.html'), `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Estilo Interior Design</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>Estilo Interior Design</h1>
        <p>Server is starting...</p>
        <script>
          // Auto-redirect to API health check
          setTimeout(() => {
            window.location.href = '/api/health';
          }, 1000);
        </script>
      </body>
      </html>
    `);
  }

  // Patch Rollup's native module before it's imported
  try {
    const modulePath = path.join(__dirname, 'node_modules/rollup/dist/native.js');
    console.log('[vercel-entry] Checking for Rollup native module at:', modulePath);
    
    if (fs.existsSync(modulePath)) {
      console.log('[vercel-entry] Patching Rollup native module');
      
      const patchContent = `
// Patched version for Vercel deployment
export function getDefaultRollupOptions() { return {}; }
export function getAugmentedNamespace() { return {}; }
export function installGlobals() {}
export function create() { return null; }
export function parse() { return { program: { body: [] } }; }
export const EMPTY_AST = { type: 'Program', body: [] };
`;
      
      fs.writeFileSync(modulePath, patchContent);
      console.log('[vercel-entry] Successfully patched Rollup native module');
    } else {
      console.log('[vercel-entry] Rollup native module not found at expected path');
    }
  } catch (err) {
    console.error('[vercel-entry] Error patching Rollup:', err);
  }
  
  console.log('[vercel-entry] Importing server module...');
  // Now import and re-export the actual server
  const server = await import('./server.js');
  console.log('[vercel-entry] Server module imported successfully');
  app = server.app;
  
} catch (err) {
  console.error('[vercel-entry] CRITICAL ERROR during initialization:', err);
  global.serverInitError = err.message;
  
  // Export the fallback app
  app = fallbackApp;
}

// Export the application
export { app }; 