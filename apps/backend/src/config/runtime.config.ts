import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseFoundationEnvironment,
  type FoundationConfig,
} from '../foundation/config/foundation.config.js'
import {
  parsePlatformEnvironment,
  type PlatformConfig,
} from '../platform/config/platform.config.js'
import { loadLayeredEnvironment } from './environment.js'

export interface RuntimeConfig {
  foundation: FoundationConfig
  platform: PlatformConfig
}

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function createRuntimeConfig(
  processEnvironment: NodeJS.ProcessEnv = process.env,
  directory = backendDirectory,
): RuntimeConfig {
  const environment = loadLayeredEnvironment(processEnvironment, directory)

  return Object.freeze({
    foundation: parseFoundationEnvironment(environment),
    platform: parsePlatformEnvironment(environment),
  })
}

export const runtimeConfig = createRuntimeConfig()
