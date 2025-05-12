# Deploying Beautiful Interiors on Railway.app

Railway.app is a modern platform that makes it easy to deploy web applications with databases. This guide will walk you through deploying your Beautiful Interiors website on Railway.

## Step 1: Set Up Railway Account

1. Sign up for an account at [Railway.app](https://railway.app/)
2. Install the Railway CLI (optional but recommended):
   ```bash
   npm i -g @railway/cli
   ```

## Step 2: Create a New Project

1. Log in to your Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select your Beautiful Interiors repository

## Step 3: Add PostgreSQL Database

1. In your project dashboard, click "New"
2. Select "Database" > "PostgreSQL"
3. Wait for the database to be provisioned
4. Click on the PostgreSQL service to view connection details

## Step 4: Configure Environment Variables

1. Go to your web service in the Railway dashboard
2. Click on the "Variables" tab
3. Add the following environment variables:
   - `DATABASE_URL`: This should be automatically linked when you add the PostgreSQL service
   - `NODE_ENV`: `production`
   - `PORT`: `3001`

## Step 5: Configure Build Settings

1. Go to the "Settings" tab of your web service
2. Set the following:
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
   - Watch Paths: Leave empty or specify paths to watch for changes

## Step 6: Deploy Your Application

1. Railway will automatically deploy your application when you push changes to your repository
2. To deploy manually, click the "Deploy" button in the dashboard

## Step 7: Run Database Migrations

1. In your project dashboard, click on your web service
2. Go to the "Settings" tab
3. Scroll down to "Custom Deploy Commands"
4. Add the following command to run after the build:
   ```bash
   npm run db:push
   ```

## Step 8: Set Up Custom Domain (Optional)

1. In your project dashboard, go to "Settings"
2. Scroll down to "Domains"
3. Click "Generate Domain" for a free Railway subdomain or "Custom Domain" to use your own domain
4. Follow the DNS instructions if using a custom domain

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify that the `DATABASE_URL` environment variable is correctly set
2. Check that the PostgreSQL service is running
3. Try restarting both the database and web service

### Build or Runtime Errors

If your application fails to build or run:

1. Check the deployment logs in the Railway dashboard
2. Ensure your `package.json` has the correct scripts defined
3. Verify that all required dependencies are installed

### Port Configuration

Railway automatically assigns a port to your application. Make sure your server code uses the PORT environment variable:

```javascript
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

## Monitoring and Scaling

1. Railway provides basic monitoring in the dashboard
2. You can view logs, metrics, and deployment history
3. To scale your application, upgrade your plan in the billing settings 