import type { Config } from 'drizzle-kit'
import { runtimeConfig } from './src/config/runtime.config.js'

export default {
  schema: './src/platform/database/schema.ts',
  out: './drizzle/platform',
  dialect: 'postgresql',
  dbCredentials: {
    url: runtimeConfig.foundation.DATABASE_URL,
  },
  migrations: {
    schema: 'drizzle',
    table: '__platform_migrations',
  },
} satisfies Config
