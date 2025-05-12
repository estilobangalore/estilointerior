#!/bin/bash
set -e

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install CSS dependencies globally
echo "Installing CSS dependencies globally..."
npm install -g autoprefixer postcss tailwindcss

# Create a temporary package.json in client directory
echo "Setting up client dependencies..."
mkdir -p client/node_modules
cat > client/package.json << EOF
{
  "name": "client",
  "private": true,
  "dependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14"
  }
}
EOF

# Install client dependencies
cd client
npm install
cd ..

# Update postcss.config.js to use CommonJS syntax
echo "Updating PostCSS config..."
cat > postcss.config.cjs << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
EOF

# Build client
echo "Building client..."
npx vite build --config vite.config.ts

# Build server
echo "Building server..."
mkdir -p dist
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "Build completed successfully!"
