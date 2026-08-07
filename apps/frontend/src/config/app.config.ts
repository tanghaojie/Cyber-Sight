/** 环境变量为空或只有空白时回退到 Cyber AI Forge 品牌默认值。 */
function configuredValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized || fallback
}

export const appConfig = Object.freeze({
  name: configuredValue(import.meta.env.VITE_APP_NAME, 'CYBER'),
  fullName: configuredValue(import.meta.env.VITE_APP_FULL_NAME, 'Cyber AI Forge'),
  tagline: configuredValue(
    import.meta.env.VITE_APP_TAGLINE,
    'AI-Native Enterprise Application Scaffold',
  ),
  productLabel: configuredValue(
    import.meta.env.VITE_APP_PRODUCT_LABEL,
    'AI-NATIVE ENTERPRISE APPLICATION SCAFFOLD',
  ),
  githubUrl: 'https://github.com/tanghaojie/cyber-scaffold',
  creatorName: 'JTLab',
  creatorFullName: '桀士实验室',
  primaryColor: '#277A52',
})
