import { z, type ZodIssue } from 'zod'

function defaultedString(fallback: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.string().default(fallback),
  )
}

const platformEnvironmentSchema = z.object({
  API_TITLE: defaultedString('Cyber-Sight API'),
  API_VERSION: defaultedString('0.1.0'),
  API_DESCRIPTION: defaultedString('Cyber-Sight business application - built on Cyber AI Forge'),
  JWT_AUDIENCE: defaultedString('cyber-ai-forge-api'),
  JWT_ISSUER: defaultedString('cyber-ai-forge'),
})

export type PlatformConfig = z.infer<typeof platformEnvironmentSchema>

function formatIssue(issue: ZodIssue): string {
  return `${issue.path.join('.')}: ${issue.message}`
}

export function parsePlatformEnvironment(environment: NodeJS.ProcessEnv): PlatformConfig {
  const parsed = platformEnvironmentSchema.safeParse(environment)

  if (!parsed.success) {
    const details = parsed.error.issues.map(formatIssue).join('; ')
    throw new Error(`Invalid Platform environment: ${details}`)
  }

  return parsed.data
}
