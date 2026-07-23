import { ref, onMounted } from 'vue'
import type { HealthResponse } from '@scaffold/api-contract'
import { apiClient } from '../../../api/client.js'

export function useHealth() {
  const status = ref<string>('loading...')
  const timestamp = ref<string>('')
  const error = ref<string | null>(null)

  async function fetchHealth() {
    error.value = null

    const { data: response, error: responseError } =
      await apiClient.GET<HealthResponse>('/health')

    if (responseError) {
      error.value = responseError.err ?? 'Failed to reach backend'
      status.value = 'error'
      timestamp.value = ''
      return
    }

    if (!response || response.status !== 0 || !response.data) {
      error.value = 'Backend returned an invalid response'
      status.value = 'error'
      timestamp.value = ''
      return
    }

    status.value = response.data.status
    timestamp.value = response.data.timestamp
  }

  onMounted(fetchHealth)

  return { status, timestamp, error, fetchHealth }
}
