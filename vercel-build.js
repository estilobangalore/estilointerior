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

// Run the client build
console.log('🔨 Building client...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Client build successful');
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
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

// Verify dist directory exists
const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error('❌ Build output not found in dist directory');
  process.exit(1);
}

// Move files to the correct location for Vercel
try {
  const publicPath = path.join(distPath, 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  // Move all files from dist to dist/public
  const files = fs.readdirSync(distPath);
  for (const file of files) {
    if (file !== 'public') {
      const sourcePath = path.join(distPath, file);
      const targetPath = path.join(publicPath, file);
      if (fs.statSync(sourcePath).isDirectory()) {
        fs.cpSync(sourcePath, targetPath, { recursive: true });
        fs.rmSync(sourcePath, { recursive: true });
      } else {
        fs.renameSync(sourcePath, targetPath);
      }
    }
  }
  console.log('✅ Files moved to correct location');
} catch (error) {
  console.error('❌ Error moving files:', error.message);
  process.exit(1);
}

console.log('✅ Vercel build process completed');
