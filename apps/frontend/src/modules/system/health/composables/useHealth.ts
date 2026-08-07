import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { HealthResponse } from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { translate } from '@/modules/system/localization/localization'

const HEALTH_CHECK_TIMEOUT_MS = 5_000

/** 在使用组件存活期间每六秒轮询进程健康状态，并在卸载时释放定时器。 */
export function useHealth() {
  const status = ref<'loading' | 'error' | 'ok'>('loading')
  const timestamp = ref<string>('')
  const error = ref<string | null>(null)
  const healthTimer = ref<number | undefined>(undefined)

  function setErrorState(message: string): void {
    error.value = message
    status.value = 'error'
    timestamp.value = ''
  }

  async function fetchHealth() {
    error.value = null
    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      controller.abort()
    }, HEALTH_CHECK_TIMEOUT_MS)

    try {
      const { data: response, error: responseError } = await apiClient.GET<HealthResponse>(
        '/health',
        {
          signal: controller.signal,
        },
      )

      if (responseError) {
        setErrorState(translate('health.errors.unreachable'))
        return
      }

      if (!response || response.status !== 0 || !response.data) {
        setErrorState(translate('shared.messages.invalidResponse'))
        return
      }

      status.value = response.data.status
      timestamp.value = response.data.timestamp
    } catch {
      setErrorState(translate('health.errors.unreachable'))
    } finally {
      window.clearTimeout(timeout)
    }
  }

  async function fetchHealthInterval() {
    // 重启轮询前先清除旧定时器，避免组件重复挂载或手动调用造成并行请求。
    clearInterval(healthTimer.value)
    await fetchHealth()

    healthTimer.value = window.setInterval(async () => {
      await fetchHealth()
    }, 6 * 1000)
  }

  onMounted(async () => {
    await fetchHealthInterval()
  })

  onBeforeUnmount(() => {
    // clearInterval 接受 undefined；无需为首次请求尚未完成的情况额外分支。
    clearInterval(healthTimer.value)
  })

  return { status, timestamp, error, fetchHealth }
}
