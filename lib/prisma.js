import 'dotenv/config'
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from 'neon-serverless';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaNeon(pool);

export const prisma = new PrismaClient({
  adapter,
});