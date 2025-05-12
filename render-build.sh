#!/bin/bash
set -e

# Install global dependencies
echo "Installing global dependencies..."
npm install -g vite esbuild

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install CSS dependencies explicitly
echo "Installing CSS dependencies..."
npm install autoprefixer postcss tailwindcss --no-save

# Build client
echo "Building client..."
cd client
mkdir -p node_modules
cp -r ../node_modules/autoprefixer ./node_modules/
cp -r ../node_modules/postcss ./node_modules/
cp -r ../node_modules/tailwindcss ./node_modules/
cd ..
vite build --config vite.config.ts

# Build server
echo "Building server..."
mkdir -p dist
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# Run migrations (if needed)
echo "Running database migrations..."
npx drizzle-kit push || echo "Migration failed, but continuing..."

echo "Build completed successfully!"
