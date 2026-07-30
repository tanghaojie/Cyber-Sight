import 'dotenv/config'
import type { Config } from 'drizzle-kit'

// Drizzle Kit 命令直接读取开发环境连接；缺失时立即停止，避免生成到错误数据库。
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env first.')
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config
