import { describe, expect, it } from 'vitest'
import { mergeEnvironmentLayers } from '@/config/environment.js'
import { parseFoundationEnvironment } from '@/foundation/config/foundation.config.js'
import { parsePlatformEnvironment } from '@/platform/config/platform.config.js'

const requiredEnvironment = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-only-jwt-secret-at-least-32-characters',
}

describe('layered backend environment', () => {
  it('keeps Foundation and Platform parsing separate', () => {
    const environment = {
      ...requiredEnvironment,
      API_TITLE: '  Custom API  ',
      JWT_ISSUER: ' custom-platform ',
    }

    expect(parseFoundationEnvironment(environment)).toMatchObject({
      DATABASE_URL: requiredEnvironment.DATABASE_URL,
      JWT_SECRET: requiredEnvironment.JWT_SECRET,
      PORT: 3000,
      HOST: '0.0.0.0',
    })
    expect(parsePlatformEnvironment(environment)).toMatchObject({
      API_TITLE: 'Custom API',
      API_VERSION: '0.1.0',
      API_DESCRIPTION: 'AI-Native Enterprise Application Scaffold',
      JWT_AUDIENCE: 'cyber-ai-forge-api',
      JWT_ISSUER: 'custom-platform',
    })
  })

  it('uses the later Platform layer and process environment as overrides', () => {
    const merged = mergeEnvironmentLayers(
      [
        { API_TITLE: 'Foundation default', PORT: '3000' },
        { API_TITLE: 'Platform local', PORT: '3333' },
      ],
      { API_TITLE: 'Deployment API' },
    )

    expect(merged).toMatchObject({ API_TITLE: 'Deployment API', PORT: '3333' })
  })

  it('rejects missing Foundation security configuration', () => {
    expect(() => parseFoundationEnvironment({})).toThrow('Invalid Foundation environment')
  })
})
