const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Starting custom build process...');
  
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Use the node_modules/.bin/vite directly
  console.log('Running vite build...');
  execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
  
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}