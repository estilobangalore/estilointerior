# Database Setup Guide

This application uses PostgreSQL with Neon Serverless and Drizzle ORM for database functionality.

## Configuration

1. Create a `.env` file in the root of your project with the following content:

```
DATABASE_URL=postgresql://username:password@host:port/database_name
```

2. Replace the placeholders with your actual database credentials.

## Database Services

You can use any PostgreSQL database service. Here are some recommendations:

- [Neon](https://neon.tech) - Free serverless PostgreSQL
- [Supabase](https://supabase.com) - Open source Firebase alternative with PostgreSQL
- [Railway](https://railway.app) - One-click PostgreSQL deployment
- Local PostgreSQL installation

## Database Management

The project includes several scripts for database management:

- `npm run db:push` - Push schema changes to the database
- `npm run db:generate` - Generate migration files based on schema changes
- `npm run db:studio` - Open Drizzle Studio to view and manage your data

## Schema

The database schema is defined in `shared/schema.ts`. It includes the following tables:

- `users` - User accounts
- `testimonials` - Customer testimonials
- `portfolioItems` - Portfolio projects
- `consultations` - Consultation requests

## Development

During development, if no `DATABASE_URL` is provided, the application will fall back to using an in-memory storage provider. This is useful for quick testing without requiring a database connection.

## Production

For production, you must set the `DATABASE_URL` environment variable to use a real database. The in-memory storage should never be used in production as data will be lost when the server restarts.

## Migrations

To create and apply database migrations:

1. Make changes to the schema in `shared/schema.ts`
2. Run `npm run db:generate` to create migration files
3. Commit the generated migration files to your repository
4. Run `npm run db:push` to apply migrations to your database

When the server starts, it will automatically apply any pending migrations. 