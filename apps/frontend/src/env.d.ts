/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORAGE_PREFIX?: string
}

declare module 'virtual:svg-icons-register' {
  const registerSvgIcons: void
  export default registerSvgIcons
}

declare module 'virtual:svg-icons-names' {
  const iconSymbolIds: string[]
  export default iconSymbolIds
}
