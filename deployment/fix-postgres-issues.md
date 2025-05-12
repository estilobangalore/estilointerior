# Fixing PostgreSQL Connection Issues

Based on the error logs from your application, you're experiencing the following PostgreSQL error:

```
Error setting up database: PostgresError: role "postgres" does not exist
```

This guide will help you fix this issue and properly connect your Beautiful Interiors application to a PostgreSQL database.

## Understanding the Issue

The error occurs because your application is trying to connect to PostgreSQL using a role/user named "postgres" that doesn't exist on your PostgreSQL server. This is a common issue when:

1. PostgreSQL was installed with a different default user
2. The "postgres" role was deleted or renamed
3. You're connecting to a managed PostgreSQL service with different credentials

## Solution 1: Create the "postgres" Role

If you have administrative access to your PostgreSQL server:

1. Connect to PostgreSQL as a superuser:
   ```bash
   psql -U <admin_user> -d postgres
   ```

2. Create the "postgres" role:
   ```sql
   CREATE ROLE postgres WITH LOGIN PASSWORD 'your_secure_password';
   ALTER ROLE postgres CREATEDB;
   ```

3. Update your `.env` file with the new password:
   ```
   DATABASE_URL=postgres://postgres:your_secure_password@localhost:5432/beautifulinteriors
   ```

## Solution 2: Use Existing Database Credentials

Instead of creating a new role, you can modify your application to use the existing database credentials:

1. Find out what user/role is available on your PostgreSQL server:
   ```bash
   psql -l
   ```
   This will list databases and their owners.

2. Update your `.env` file with the correct credentials:
   ```
   DATABASE_URL=postgres://existing_user:password@localhost:5432/beautifulinteriors
   ```

## Solution 3: Use a Managed PostgreSQL Service

For production, it's often easier to use a managed PostgreSQL service:

1. Sign up for a service like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
2. Create a new PostgreSQL database
3. Get the connection string from the service dashboard
4. Update your `.env` file:
   ```
   DATABASE_URL=postgres://provided_user:provided_password@provided_host:5432/beautifulinteriors
   ```

## Solution 4: Modify Your Database Connection Code

If you can't change the database user, you can modify your application code:

1. Open `server/db.ts`
2. Update the connection string to use a different user:
   ```javascript
   const connectionString = process.env.DATABASE_URL || 'postgres://your_actual_user:your_actual_password@localhost:5432/beautifulinteriors';
   ```

## Port Conflict Resolution

You're also experiencing a port conflict error:

```
Error: listen EADDRINUSE: address already in use :::3001
```

To fix this:

1. Find the process using port 3001:
   ```bash
   # On macOS/Linux
   sudo lsof -i :3001
   
   # On Windows
   netstat -ano | findstr :3001
   ```

2. Kill the process:
   ```bash
   # On macOS/Linux
   kill -9 <PID>
   
   # On Windows
   taskkill /PID <PID> /F
   ```

3. Alternatively, change the port in your `.env` file:
   ```
   PORT=3002
   ```

## Testing Your Connection

After making these changes:

1. Restart your application:
   ```bash
   npm run dev
   ```

2. Check the logs to confirm a successful database connection

3. If using the database in memory mode works but PostgreSQL connection still fails, you may need to check:
   - PostgreSQL server is running
   - Firewall settings allow connections
   - Network connectivity between your application and database 