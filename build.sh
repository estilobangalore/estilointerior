#!/bin/bash
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Make sure client directory structure exists
echo "Setting up directory structure..."
mkdir -p client/src/components/ui
mkdir -p client/src/hooks
mkdir -p client/src/lib

# Copy necessary UI component files if they don't exist in the build directory
echo "Copying UI component files..."
cp -r client/src/components/ui/* dist/components/ui/ || echo "Failed to copy UI components, but continuing..."
cp -r client/src/hooks/* dist/hooks/ || echo "Failed to copy hooks, but continuing..."
cp -r client/src/lib/* dist/lib/ || echo "Failed to copy lib files, but continuing..."

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
