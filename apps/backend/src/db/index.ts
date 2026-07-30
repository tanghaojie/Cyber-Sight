import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/config/env.js'
import * as schema from './schema.js'

// postgres-js 负责连接，Drizzle 在同一客户端上提供带 Schema 类型的查询接口。
export const databaseClient = postgres(env.DATABASE_URL)

export const db = drizzle(databaseClient, { schema })
export type Database = typeof db
