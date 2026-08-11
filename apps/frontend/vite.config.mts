import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(function createViteConfig({ mode }) {
  const env = loadEnv(mode, process.cwd())
  const port = Number(env.VITE_PORT || 3333)
  const backendPort = Number(env.VITE_BACKEND_PORT || 3000)

  return {
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
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
