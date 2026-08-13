import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parse } from 'dotenv'

const environmentFileNames = ['.env', '.env.local', '.env.foundation.local', '.env.platform.local']

export function mergeEnvironmentLayers(
  fileEnvironments: NodeJS.ProcessEnv[],
  processEnvironment: NodeJS.ProcessEnv,
): NodeJS.ProcessEnv {
  return Object.assign({}, ...fileEnvironments, processEnvironment)
}

export function loadLayeredEnvironment(
  processEnvironment: NodeJS.ProcessEnv = process.env,
  directory = process.cwd(),
): NodeJS.ProcessEnv {
  const fileEnvironments = environmentFileNames.flatMap((fileName) => {
    const filePath = resolve(directory, fileName)
    return existsSync(filePath) ? [parse(readFileSync(filePath))] : []
  })

  return mergeEnvironmentLayers(fileEnvironments, processEnvironment)
}
