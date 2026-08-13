function configuredValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized || fallback
}

export const platformConfig = Object.freeze({
  name: configuredValue(import.meta.env.VITE_APP_NAME, 'CYBER'),
  fullName: configuredValue(import.meta.env.VITE_APP_FULL_NAME, 'Cyber AI Forge'),
  tagline: configuredValue(
    import.meta.env.VITE_APP_TAGLINE,
    'AI-Native Enterprise Application Scaffold',
  ),
  githubUrl: configuredValue(
    import.meta.env.VITE_APP_GITHUB_URL,
    'https://github.com/tanghaojie/cyber-scaffold',
  ),
  creatorName: configuredValue(import.meta.env.VITE_APP_CREATOR_NAME, 'JTLab'),
  creatorFullName: configuredValue(import.meta.env.VITE_APP_CREATOR_FULL_NAME, '桀士实验室'),
  storagePrefix: configuredValue(import.meta.env.VITE_STORAGE_PREFIX, 'cyber_ai_forge'),
})
