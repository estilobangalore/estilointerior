const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Starting custom build process...');
  
  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Create a build.mjs file that uses import() to dynamically load vite
  const buildScript = `
  async function build() {
    try {
      const vite = await import('vite');
      await vite.build();
      console.log('Build completed successfully');
    } catch (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
  }
  
  build();
  `;
  
  fs.writeFileSync(path.join(__dirname, 'build.mjs'), buildScript);
  
  // Run the build script
  console.log('Running build script...');
  execSync('node build.mjs', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
