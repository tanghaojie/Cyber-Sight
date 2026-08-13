import { z, type ZodIssue } from 'zod'

function defaultedString(fallback: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.string().default(fallback),
  )
}

function defaultedPort(fallback: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.coerce.number().int().min(1).max(65535).default(fallback),
  )
}

const foundationEnvironmentSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  PORT: defaultedPort(3000),
  HOST: defaultedString('0.0.0.0'),
})

export type FoundationConfig = z.infer<typeof foundationEnvironmentSchema>

function formatIssue(issue: ZodIssue): string {
  return `${issue.path.join('.')}: ${issue.message}`
}

export function parseFoundationEnvironment(environment: NodeJS.ProcessEnv): FoundationConfig {
  const parsed = foundationEnvironmentSchema.safeParse(environment)

  if (!parsed.success) {
    const details = parsed.error.issues.map(formatIssue).join('; ')
    throw new Error(`Invalid Foundation environment: ${details}`)
  }

  return parsed.data
}
