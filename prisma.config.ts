import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/prisma.schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_DATABASE_URL') || env('DATABASE_URL'),
    // Let Prisma automatically create a temporary shadow database
    // Railway's Postgres user typically has permission to create databases
    // Prisma will create a temporary shadow DB (e.g., railway_shadow) during migration
  },
})

