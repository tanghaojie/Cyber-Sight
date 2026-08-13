import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

function loadLayeredEnvironment(mode: string): Record<string, string> {
  const standardEnvironment = loadEnv(mode, process.cwd(), '')
  const foundationEnvironment = loadEnv('foundation', process.cwd(), '')
  const platformEnvironment = loadEnv('platform', process.cwd(), '')
  const foundationKeys = ['VITE_PORT', 'VITE_BACKEND_PORT']
  const platformKeys = [
    'VITE_APP_NAME',
    'VITE_APP_FULL_NAME',
    'VITE_APP_TAGLINE',
    'VITE_APP_GITHUB_URL',
    'VITE_APP_CREATOR_NAME',
    'VITE_APP_CREATOR_FULL_NAME',
    'VITE_STORAGE_PREFIX',
  ]

  const scopedValues = function scopedValues(
    environment: Record<string, string>,
    keys: string[],
  ): Record<string, string> {
    return Object.fromEntries(
      keys.flatMap((key) => (environment[key] ? [[key, environment[key]]] : [])),
    )
  }

  return {
    ...standardEnvironment,
    ...scopedValues(foundationEnvironment, foundationKeys),
    ...scopedValues(platformEnvironment, platformKeys),
    ...process.env,
  } as Record<string, string>
}

function publicEnvironment(environment: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(environment)
      .filter(([key]) => key.startsWith('VITE_'))
      .map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  )
}

export default defineConfig(function createViteConfig({ mode }) {
  const environment = loadLayeredEnvironment(mode)
  const port = Number(environment.VITE_PORT || 3333)
  const backendPort = Number(environment.VITE_BACKEND_PORT || 3000)

  return {
    define: publicEnvironment(environment),
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/foundation/assets/icons')],
        symbolId: 'icon-[name]',
      }),
      tailwindcss(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        dts: false,
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: false,
      }),
    ],
    server: {
      port,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          rewrite(path) {
            return path.replace(/^\/api/, '')
          },
        },
      },
    },
  }
})
