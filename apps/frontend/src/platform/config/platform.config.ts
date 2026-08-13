function configuredValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized || fallback
}

export const platformConfig = Object.freeze({
  name: configuredValue(import.meta.env.VITE_APP_NAME, 'CYBER-SIGHT'),
  fullName: configuredValue(import.meta.env.VITE_APP_FULL_NAME, 'Cyber-Sight'),
  tagline: configuredValue(import.meta.env.VITE_APP_TAGLINE, 'AI-Native Business Application'),
  githubUrl: configuredValue(
    import.meta.env.VITE_APP_GITHUB_URL,
    'https://github.com/tanghaojie/Cyber-Sight',
  ),
  creatorName: configuredValue(import.meta.env.VITE_APP_CREATOR_NAME, 'JTLab'),
  creatorFullName: configuredValue(import.meta.env.VITE_APP_CREATOR_FULL_NAME, '桀士实验室'),
  storagePrefix: configuredValue(import.meta.env.VITE_STORAGE_PREFIX, 'cyber_ai_forge'),
})
