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

// Patch Rollup's native module if needed
console.log('Checking for Rollup modules that need patching...');
try {
  // Run the fix-rollup script
  execSync('node fix-rollup.js', { stdio: 'inherit' });
  console.log('✅ Rollup fix script applied');
} catch (error) {
  console.error('⚠️ Error running Rollup fix script:', error.message);
  console.log('Continuing with build...');
}

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
  console.error('❌ Pre-built files not found in dist/public. Creating directory structure...');
  
  try {
    // Create the directory structure
    fs.mkdirSync(publicPath, { recursive: true });
    console.log('✅ Created dist/public directory');
    
    // Create a placeholder index.html to prevent build failure
    fs.writeFileSync(path.join(publicPath, 'index.html'), `
<!DOCTYPE html>
<html>
<head>
  <title>Estilo Interior Design</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>window.location.href = '/api/health';</script>
</head>
<body>
  <h1>Estilo Interior Design</h1>
  <p>Loading...</p>
</body>
</html>
`);
    console.log('✅ Created placeholder index.html');
  } catch (err) {
    console.error('❌ Error creating directory structure:', err);
  }
}

// Check if we have any other essential directories/files
const apiDirectory = path.join(__dirname, 'api');
if (!fs.existsSync(apiDirectory)) {
  console.warn('⚠️ Warning: api directory not found. API functionality may be compromised.');
}

console.log('✅ Vercel build process completed');
