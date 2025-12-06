/**
 * Prisma 7 Configuration
 * 
 * Connection URLs are now configured here instead of in schema.prisma
 * This file is used by Prisma Migrate and other CLI tools
 */

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL, // Used for migrations
  },
};

