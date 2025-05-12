# Beautiful Interiors Website Deployment Guide

This guide will walk you through deploying the Beautiful Interiors website on a production server with PostgreSQL database connection.

## Prerequisites

- A VPS or cloud server (Recommended: DigitalOcean, Render, Railway, or Vercel)
- PostgreSQL database (Can use Neon, Supabase, or Railway PostgreSQL)
- Domain name (optional but recommended)
- Node.js v16+ installed on the server

## Step 1: Set Up PostgreSQL Database

1. Sign up for a PostgreSQL service like [Neon](https://neon.tech) (they offer a free tier)
2. Create a new database named `beautifulinteriors`
3. Note down your database connection string, which will look like:
   ```
   postgres://username:password@host:5432/beautifulinteriors
   ```

## Step 2: Prepare Your Application

1. Create a `.env` file in the project root with the following content:
   ```
   DATABASE_URL=postgres://username:password@host:5432/beautifulinteriors
   PORT=3001
   NODE_ENV=production
   ```
   Replace the `DATABASE_URL` with your actual database connection string.

2. Build the application:
   ```bash
   npm run build
   ```

## Step 3: Deploy on a VPS (e.g., DigitalOcean)

1. Create a new droplet/VPS
2. SSH into your server
3. Install Node.js, npm, and nginx:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

4. Clone your repository:
   ```bash
   git clone https://your-repository-url.git
   cd BeautifulInteriors
   ```

5. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

6. Create a `.env` file with your production environment variables
   
7. Set up PM2 to keep your application running:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name beautiful-interiors
   pm2 startup
   pm2 save
   ```

8. Configure Nginx as a reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/beautiful-interiors
   ```

   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/beautiful-interiors /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. Set up SSL with Let's Encrypt:
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```

## Step 4: Deploy on Render (Alternative)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
4. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `PORT`: 3001
   - `NODE_ENV`: production
5. Deploy the service

## Step 5: Database Migration

1. Run database migrations:
   ```bash
   npm run db:push
   ```

## Troubleshooting

### PostgreSQL Connection Issues

If you encounter the error `role "postgres" does not exist`, you need to create the postgres role:

1. Connect to your PostgreSQL instance
2. Run:
   ```sql
   CREATE ROLE postgres WITH LOGIN PASSWORD 'your_password';
   ALTER ROLE postgres CREATEDB;
   ```

### Port Already in Use

If you see `Error: listen EADDRINUSE: address already in use :::3001`:

1. Find the process using the port:
   ```bash
   sudo lsof -i :3001
   ```
2. Kill the process:
   ```bash
   sudo kill -9 <PID>
   ```

## Maintenance

1. Set up regular database backups
2. Monitor server resources
3. Update dependencies regularly for security patches 