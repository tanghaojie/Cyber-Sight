import 'dotenv/config'
import type { Config } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env first.')
}

export default {
  schema: './src/foundation/database/schema.ts',
  out: './drizzle/foundation',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    schema: 'drizzle',
    table: '__foundation_migrations',
  },
} satisfies Config
