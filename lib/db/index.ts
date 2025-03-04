import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Check if the DATABASE_URL environment variable is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

// Create a SQL connection
const sql = neon(process.env.DATABASE_URL);

// Create a Drizzle ORM instance
export const db = drizzle(sql); 