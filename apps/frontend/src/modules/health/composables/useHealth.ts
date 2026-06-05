import { ref, onMounted } from 'vue'
import { apiClient } from '../../../api/client.js'

export function useHealth() {
  const status = ref<string>('loading...')
  const timestamp = ref<string>('')
  const error = ref<string | null>(null)

  const fetchHealth = async () => {
    const { data, error: err } = await apiClient.GET('/health')
    if (err) {
      error.value = 'Failed to reach backend'
      status.value = 'error'
      return
    }
    status.value = data.status
    timestamp.value = data.timestamp
  }

  onMounted(fetchHealth)

  return { status, timestamp, error, fetchHealth }
}
