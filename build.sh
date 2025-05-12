#!/bin/bash
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Create client directory structure if it doesn't exist
echo "Setting up directory structure..."
mkdir -p client/src

# Create a basic index.html if it doesn't exist
if [ ! -f client/index.html ]; then
  echo "Creating basic index.html..."
  cat > client/index.html << EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Beautiful Interiors</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
fi

# Build client
echo "Building client..."
npm run build:client

# Verify client build output
echo "Checking client build output..."
ls -la dist/public || echo "Error: dist/public directory not created"
ls -la dist/public/assets || echo "Error: assets directory not created"

# Build server
echo "Building server..."
npm run build:server

echo "Build completed"
