import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { runtimeConfig } from '@/config/runtime.config.js'
import * as schema from '@/database.schema.js'

export const databaseClient = postgres(runtimeConfig.foundation.DATABASE_URL)
export const db = drizzle(databaseClient, { schema })
export type Database = typeof db
