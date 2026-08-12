// 在任何配置读取前加载本地 .env；生产环境可直接由进程环境提供同名值。
import 'dotenv/config'
import { z, type ZodIssue } from 'zod'

function defaultedString(fallback: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.string().default(fallback),
  )
}

// 启动时一次性校验全部必需配置，避免请求处理中才暴露缺失或非法环境变量。
const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  API_TITLE: defaultedString('Cyber AI Forge API'),
  API_VERSION: defaultedString('0.1.0'),
  API_DESCRIPTION: defaultedString(
    'CYBER management scaffold — runtime-safe, modular, and AI-native',
  ),
  JWT_AUDIENCE: defaultedString('cyber-ai-forge-api'),
  JWT_ISSUER: defaultedString('cyber-ai-forge'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
})

function formatIssue(issue: ZodIssue): string {
  return `${issue.path.join('.')}: ${issue.message}`
}

export function parseEnvironment(environment: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(environment)

  if (!parsed.success) {
    // 启动即失败而非用默认值掩盖安全配置错误；错误信息只包含字段路径和校验说明，不回显配置值。
    const details = parsed.error.issues.map(formatIssue).join('; ')
    throw new Error(`Invalid backend environment: ${details}`)
  }

  return parsed.data
}

// 解析结果在模块加载期固定，其他模块只消费已验证的 env，不再各自处理 string | undefined。
export const env = parseEnvironment(process.env)
