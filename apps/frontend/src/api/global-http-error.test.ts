import { describe, expect, it, vi } from 'vitest'
import {
  dispatchGlobalHttpError,
  GLOBAL_HTTP_ERROR_EVENT,
  type GlobalHttpErrorDetail,
} from './global-http-error.js'

describe('global HTTP error interceptor', () => {
  it.each([401, 404, 500])('dispatches HTTP %s as a global event', async (status) => {
    const listener = vi.fn()
    window.addEventListener(GLOBAL_HTTP_ERROR_EVENT, listener)

    await dispatchGlobalHttpError(
      new Response(JSON.stringify({ status: 1001, err: 'Request failed' }), {
        status,
        headers: { 'content-type': 'application/json' },
      })
    )

    expect(listener).toHaveBeenCalledOnce()
    const event = listener.mock.calls[0][0] as CustomEvent<GlobalHttpErrorDetail>
    expect(event.detail).toEqual({
      httpStatus: status,
      status: 1001,
      err: 'Request failed',
    })

    window.removeEventListener(GLOBAL_HTTP_ERROR_EVENT, listener)
  })

  it.each([200, 400, 403, 409, 429, 502])(
    'leaves HTTP %s to the calling business module',
    async (status) => {
      const listener = vi.fn()
      window.addEventListener(GLOBAL_HTTP_ERROR_EVENT, listener)

      await dispatchGlobalHttpError(new Response(null, { status }))

      expect(listener).not.toHaveBeenCalled()
      window.removeEventListener(GLOBAL_HTTP_ERROR_EVENT, listener)
    }
  )
})
