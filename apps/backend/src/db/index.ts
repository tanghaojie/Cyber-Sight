import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

// 切换数据库：将 drizzle-orm/postgres-js 换成 drizzle-orm/mysql2
const connectionString = process.env.DATABASE_URL ?? 'postgres://localhost:5432/scaffold'
const client = postgres(connectionString)

export const db = drizzle(client, { schema })
export type Database = typeof db
