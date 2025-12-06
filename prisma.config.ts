import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/prisma.schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DIRECT_DATABASE_URL') || env('DATABASE_URL'),
  },
  // Use the same database as shadow database to avoid pgvector extension issues
  shadowDatabaseUrl: env('DIRECT_DATABASE_URL') || env('DATABASE_URL'),
})

