/** 环境变量为空或只有空白时回退到脚手架品牌默认值。 */
function configuredValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized || fallback
}

export const appConfig = Object.freeze({
  name: configuredValue(import.meta.env.VITE_APP_NAME, 'CYBER'),
  fullName: configuredValue(import.meta.env.VITE_APP_FULL_NAME, 'Cyber Scaffold'),
  tagline: configuredValue(import.meta.env.VITE_APP_TAGLINE, 'Build clearly. Evolve safely.'),
  productLabel: configuredValue(import.meta.env.VITE_APP_PRODUCT_LABEL, 'SYSTEM SCAFFOLD'),
  creatorName: 'JTLab',
  creatorFullName: '桀士实验室',
  primaryColor: '#277A52',
})
