/** 环境变量为空或只有空白时回退到 Cyber-Sight 下游产品默认值。 */
function configuredValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized || fallback
}

export const appConfig = Object.freeze({
  name: configuredValue(import.meta.env.VITE_APP_NAME, 'CYBER-SIGHT'),
  fullName: configuredValue(import.meta.env.VITE_APP_FULL_NAME, 'Cyber-Sight'),
  tagline: configuredValue(import.meta.env.VITE_APP_TAGLINE, 'AI-Native Business Application'),
  githubUrl: configuredValue(
    import.meta.env.VITE_APP_GITHUB_URL,
    'https://github.com/tanghaojie/Cyber-Sight',
  ),
  creatorName: 'JTLab',
  creatorFullName: '桀士实验室',
  primaryColor: '#277A52',
})
