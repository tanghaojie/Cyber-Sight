import 'dotenv/config'
import { z, type ZodIssue } from 'zod'

// 启动时一次性校验全部必需配置，避免请求处理中才暴露缺失或非法环境变量。
const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
})

const parsed = envSchema.safeParse(process.env)

function formatIssue(issue: ZodIssue): string {
  return `${issue.path.join('.')}: ${issue.message}`
}

if (!parsed.success) {
  const details = parsed.error.issues.map(formatIssue).join('; ')
  throw new Error(`Invalid backend environment: ${details}`)
}

export const env = parsed.data
