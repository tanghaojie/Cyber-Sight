import { describe, expect, it } from 'vitest'
import { parseEnvironment } from '@/foundation/config/env.js'

const requiredEnvironment = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-only-jwt-secret-at-least-32-characters',
}

describe('backend environment', () => {
  it('uses platform defaults when optional values are missing or blank', () => {
    const parsed = parseEnvironment({
      ...requiredEnvironment,
      API_TITLE: '  ',
      JWT_ISSUER: '',
    })

    expect(parsed).toMatchObject({
      API_TITLE: 'Cyber AI Forge API',
      API_VERSION: '0.1.0',
      API_DESCRIPTION: 'CYBER management scaffold — runtime-safe, modular, and AI-native',
      JWT_AUDIENCE: 'cyber-ai-forge-api',
      JWT_ISSUER: 'cyber-ai-forge',
    })
  })

  it('trims configured platform values', () => {
    const parsed = parseEnvironment({
      ...requiredEnvironment,
      API_TITLE: '  Custom API  ',
      API_VERSION: ' 2.0.0 ',
      API_DESCRIPTION: ' Custom description ',
      JWT_AUDIENCE: ' custom-api ',
      JWT_ISSUER: ' custom-platform ',
    })

    expect(parsed).toMatchObject({
      API_TITLE: 'Custom API',
      API_VERSION: '2.0.0',
      API_DESCRIPTION: 'Custom description',
      JWT_AUDIENCE: 'custom-api',
      JWT_ISSUER: 'custom-platform',
    })
  })
})
