# Setting Up Neon PostgreSQL with Vercel

This guide will help you connect your Neon PostgreSQL database to your Vercel deployment.

## 1. Create a Neon Account and Database

1. Go to [https://neon.tech](https://neon.tech) and sign up for an account
2. Create a new project (e.g., "Estilo")
3. Set up a new PostgreSQL database within your project
4. Make note of your connection string, which will look like:
   ```
   postgresql://username:password@host:port/database_name
   ```

## 2. Configure Your Local Environment

### Option 1: Use the setup script

Run our provided setup script:

```bash
./neon-setup.sh
```

### Option 2: Manual setup

Create a `.env.local` file in your project root with:

```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

Replace with your actual Neon connection string.

## 3. Test the Database Connection

Run the database connection tester:

```bash
node vercel-neon-setup.js
```

This will verify if your connection is working correctly.

## 4. Set Up Vercel Environment Variables

### Option 1: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string
5. Select all environments (Production, Preview, Development)
6. Click **Save**

### Option 2: Using Vercel CLI

```bash
vercel env add DATABASE_URL
```

When prompted, enter your Neon connection string and select all environments.

## 5. Deploy Your Application

Deploy your application to Vercel:

```bash
vercel
```

## 6. Verify the Connection

After deployment, check if your application can connect to the database by:

1. Visiting your deployed application
2. Checking the logs in Vercel dashboard for any database-related errors

## Troubleshooting

If you encounter connection issues:

1. **Connection Refused**: Make sure your Neon database is active and the connection string is correct.
2. **SSL Issues**: Neon requires SSL. The connection code should include:
   ```javascript
   ssl: {
     rejectUnauthorized: false
   }
   ```
3. **Network Restrictions**: Ensure Vercel's IP range is allowed in Neon's connection settings.
4. **Credential Issues**: Double-check username and password in your connection string.

## Database Migrations

To update your database schema:

```bash
# Run locally with your .env file containing DATABASE_URL
npm run db:push
```

## Next Steps

After successful connection:
1. Verify all tables are created correctly
2. Test CRUD operations through your application
3. Set up regular backups of your Neon database

---

For more help, consult the [Neon Documentation](https://neon.tech/docs/) or [Vercel Documentation](https://vercel.com/docs). 