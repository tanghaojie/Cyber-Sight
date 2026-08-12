/** 当前业务平台拥有的 API 展示信息和 JWT 身份；下游平台只在 Platform 内修改。 */
export const platformConfig = Object.freeze({
  api: {
    title: 'Cyber AI Forge API',
    version: '0.1.0',
    description: 'CYBER management scaffold — runtime-safe, modular, and AI-native',
  },
  jwt: {
    audience: 'cyber-ai-forge-api',
    issuer: 'cyber-ai-forge',
  },
})
