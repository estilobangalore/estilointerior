import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting Vercel build process...');

// Ensure environment variables are set
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set. Using fallback connection string.');
}

// Skip TypeScript compilation in Vercel environment
console.log('Skipping TypeScript compilation in Vercel environment...');

// Verify database connection
try {
  console.log('🔍 Checking database connection...');
  execSync('node check-db.js', { stdio: 'inherit' });
  console.log('✅ Database connection successful');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  // We allow the build to continue even if DB check fails
  // This is because Vercel might not have access to the DB during build
  console.log('Continuing with build despite database connection failure...');
}

// Build the client
console.log('🔨 Building client...');
try {
  // Set NODE_OPTIONS to avoid native module issues with Rollup
  process.env.NODE_OPTIONS = '--no-native-modules';
  // Use a simpler build command without native dependencies
  execSync('npx vite build --mode=production', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_FORCE_FALLBACK: 'true' // Force Vite to use JS fallbacks
    }
  });
  console.log('✅ Client build successful');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Create a simple index.html with a meta refresh if it doesn't exist
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(distPath, 'public');

if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}

const indexPath = path.join(publicPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('📝 Creating fallback index.html');
  fs.writeFileSync(indexPath, `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Estilo - Interior Design</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/client.js"></script>
      </body>
    </html>
  `);
}

console.log('✅ Vercel build process completed');
