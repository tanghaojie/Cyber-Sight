import 'dotenv/config'
import type { Config } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env first.')
}

export default {
  schema: './src/platform/database/schema.ts',
  out: './drizzle/platform',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    schema: 'drizzle',
    table: '__platform_migrations',
  },
} satisfies Config
