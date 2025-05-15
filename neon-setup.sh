#!/bin/bash

# Setup script for Neon PostgreSQL Database with Vercel

echo "=== Neon Database Setup for Vercel ==="
echo ""
echo "This script will help you set up your Neon database connection for your Vercel project."
echo ""

# Check if the DATABASE_URL is already set
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is already set in your environment."
  echo "Current value: ${DATABASE_URL:0:15}*****"
  echo ""
  read -p "Do you want to override it? (y/n): " override
  if [ "$override" != "y" ]; then
    echo "Keeping existing DATABASE_URL."
    exit 0
  fi
fi

# Get the Neon connection string
echo ""
echo "Please enter your Neon PostgreSQL connection string:"
echo "(Format: postgresql://username:password@host:port/database_name)"
read -p "> " neon_url

if [ -z "$neon_url" ]; then
  echo "Error: Connection string cannot be empty."
  exit 1
fi

# Validate connection string format (basic check)
if [[ ! $neon_url =~ ^postgresql://.*@.*:.*/.*$ ]]; then
  echo "Error: Invalid connection string format."
  echo "Format should be: postgresql://username:password@host:port/database_name"
  exit 1
fi

# Export to shell session
export DATABASE_URL="$neon_url"
echo "DATABASE_URL has been set for this shell session."

# Verify the database connection
echo ""
echo "Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Connected to database successfully!');
    console.log('Database time:', res.rows[0].now);
    pool.end();
  })
  .catch(err => {
    console.error('❌ Failed to connect to database.');
    console.error(err.message);
    process.exit(1);
  });
"

# Instructions for Vercel
echo ""
echo "=== Vercel Setup Instructions ==="
echo ""
echo "To set up this connection string on Vercel:"
echo ""
echo "1. Go to your Vercel dashboard (https://vercel.com/dashboard)"
echo "2. Select your project"
echo "3. Go to 'Settings' > 'Environment Variables'"
echo "4. Add a new variable:"
echo "   - Key: DATABASE_URL" 
echo "   - Value: $neon_url"
echo "5. Select all environments (Production, Preview, Development)"
echo "6. Click 'Save'"
echo ""
echo "You can also use the Vercel CLI to add this environment variable:"
echo ""
echo "vercel env add DATABASE_URL"
echo ""
echo "=== Setup Complete ===" 