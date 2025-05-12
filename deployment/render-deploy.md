# Deploying Beautiful Interiors on Render.com

Render.com offers an easy way to deploy Node.js applications with PostgreSQL databases. This guide will walk you through the process.

## Step 1: Set Up PostgreSQL Database on Render

1. Log in to your Render account
2. Navigate to the Dashboard and click on "New" > "PostgreSQL"
3. Fill in the following details:
   - Name: `beautiful-interiors-db`
   - Database: `beautifulinteriors`
   - User: Leave default
   - Region: Choose the closest to your users
   - PostgreSQL Version: 14 or higher
4. Click "Create Database"
5. Once created, note down the "External Database URL" - this will be your `DATABASE_URL`

## Step 2: Prepare Your Repository

1. Make sure your repository has the following files:
   - `package.json` with build and start scripts
   - `vite.config.ts` for client-side build
   - Server code that reads environment variables

2. Create a `render.yaml` file in the root of your project:

```yaml
services:
  - type: web
    name: beautiful-interiors
    env: node
    buildCommand: npm install && npm run build
    startCommand: node dist/index.js
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: beautiful-interiors-db
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001

databases:
  - name: beautiful-interiors-db
    databaseName: beautifulinteriors
    user: postgres
    plan: free
```

## Step 3: Deploy on Render

1. Log in to your Render account
2. Click on "New" > "Web Service"
3. Connect your GitHub repository
4. Use the following settings:
   - Name: `beautiful-interiors`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
5. Add environment variables:
   - `DATABASE_URL`: Copy from your PostgreSQL service
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
6. Click "Create Web Service"

## Step 4: Set Up Automatic Database Migrations

1. In your Render dashboard, go to your web service
2. Click on "Shell"
3. Run the database migration command:
   ```bash
   npm run db:push
   ```

## Step 5: Custom Domain (Optional)

1. In your web service dashboard, go to "Settings"
2. Scroll down to "Custom Domain"
3. Click "Add Domain"
4. Enter your domain name and follow the DNS instructions

## Troubleshooting

### Database Connection Issues

If you see errors connecting to the database:

1. Check that your `DATABASE_URL` is correctly set in the environment variables
2. Make sure your IP is allowed in the database firewall settings
3. Verify that the database user has the correct permissions

### Build Failures

If your build fails:

1. Check the build logs for specific errors
2. Ensure all dependencies are properly listed in `package.json`
3. Verify that your build script in `package.json` is correct

### Application Crashes

If your application crashes after deployment:

1. Check the logs in the Render dashboard
2. Ensure your start command is correct
3. Verify that all required environment variables are set

## Monitoring and Scaling

1. Monitor your application's performance in the Render dashboard
2. Set up alerts for high CPU or memory usage
3. Upgrade your plan if you need more resources 