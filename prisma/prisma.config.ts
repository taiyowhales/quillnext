import { defineConfig } from "prisma";

/**
 * Prisma 7 Configuration
 * 
 * Connection URLs are now configured here instead of in schema.prisma
 * This file is used by Prisma Migrate and other CLI tools
 * 
 * For Accelerate: Use PRISMA_ACCELERATE_URL in your .env
 * For direct connection: Use DATABASE_URL in your .env
 */
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL, // Used for migrations
  },
});
