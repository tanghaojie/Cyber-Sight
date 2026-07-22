import 'dotenv/config'
import { z, type ZodIssue } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
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
