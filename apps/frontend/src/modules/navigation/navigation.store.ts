import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { NavigationMenu } from '@scaffold/api-contract'
import { resolveNavigationPaths } from '@/shared/routing/menu-paths'
import { fetchNavigation } from './navigation.api'

function flattenTree(nodes: NavigationMenu[]): NavigationMenu[] {
  return nodes.flatMap((node) => [node, ...flattenTree(node.children)])
}

export const useNavigationStore = defineStore('navigation', () => {
  const items = ref<NavigationMenu[]>([])
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref('')
  const flatItems = computed(() => flattenTree(items.value))

  async function load(force = false): Promise<void> {
    if ((loaded.value && !force) || loading.value) {
      return
    }
    loading.value = true
    error.value = ''
    try {
      items.value = resolveNavigationPaths(await fetchNavigation())
      loaded.value = true
    } catch (cause) {
      items.value = []
      loaded.value = false
      error.value = cause instanceof Error ? cause.message : '导航配置加载失败'
      throw cause
    } finally {
      loading.value = false
    }
  }

  function clear(): void {
    items.value = []
    loaded.value = false
    loading.value = false
    error.value = ''
  }

  return { items, flatItems, loaded, loading, error, load, clear }
})
