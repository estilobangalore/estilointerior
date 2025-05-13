import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the configuration schema
const configSchema = z.object({
  DATABASE_URL: z.string().optional(),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  PORT: z.string().default('3001'),
});

// Parse and validate the configuration
const config = configSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-fallback-secret-key',
  PORT: '3001', // Always use port 3001 regardless of environment variable
});

export default config; 