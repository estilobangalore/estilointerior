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

// Skip client build - we're using pre-built files committed to the repo
console.log('🔨 Skipping client build - using pre-built files in dist/public');

// Verify dist/public directory exists
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(distPath, 'public');

if (!fs.existsSync(publicPath)) {
  console.error('❌ Pre-built files not found in dist/public. Please run "npm run build" locally and commit the files.');
  process.exit(1);
}

// Verify index.html exists
const indexPath = path.join(publicPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in dist/public. Please run "npm run build" locally and commit the files.');
  process.exit(1);
}

console.log('✅ Pre-built client files verified');
console.log('✅ Vercel build process completed');
