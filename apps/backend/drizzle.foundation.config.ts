import type { Config } from 'drizzle-kit'
import { runtimeConfig } from './src/config/runtime.config.js'

export default {
  schema: './src/foundation/database/schema.ts',
  out: './drizzle/foundation',
  dialect: 'postgresql',
  dbCredentials: {
    url: runtimeConfig.foundation.DATABASE_URL,
  },
  migrations: {
    schema: 'drizzle',
    table: '__foundation_migrations',
  },
} satisfies Config
