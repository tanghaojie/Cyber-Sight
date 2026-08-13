/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_FULL_NAME?: string
  readonly VITE_APP_TAGLINE?: string
  readonly VITE_APP_GITHUB_URL?: string
  readonly VITE_APP_CREATOR_NAME?: string
  readonly VITE_APP_CREATOR_FULL_NAME?: string
  readonly VITE_STORAGE_PREFIX?: string
  readonly VITE_PORT?: string
  readonly VITE_BACKEND_PORT?: string
}

declare module 'virtual:svg-icons-register' {
  const registerSvgIcons: void
  export default registerSvgIcons
}

declare module 'virtual:svg-icons-names' {
  const iconSymbolIds: string[]
  export default iconSymbolIds
}
