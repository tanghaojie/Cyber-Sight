import { describe, expect, it, vi } from 'vitest'
import { handleGlobalHttpError, installGlobalHttpErrorHandler } from './global-http-error.js'

describe('global HTTP error interceptor', () => {
  it.each([401, 404, 500])(
    'passes HTTP %s to the installed application handler',
    async (status) => {
      const handler = vi.fn()
      const uninstall = installGlobalHttpErrorHandler(handler)

      await handleGlobalHttpError(
        new Response(JSON.stringify({ status: 1001, err: 'Request failed' }), {
          status,
          headers: { 'content-type': 'application/json' },
        }),
      )

      expect(handler).toHaveBeenCalledWith({
        httpStatus: status,
        status: 1001,
        err: 'Request failed',
      })
      uninstall()
    },
  )

  it.each([200, 400, 403, 409, 429, 502])(
    'leaves HTTP %s to the calling business module',
    async (status) => {
      const handler = vi.fn()
      const uninstall = installGlobalHttpErrorHandler(handler)
      await handleGlobalHttpError(new Response(null, { status }))
      expect(handler).not.toHaveBeenCalled()
      uninstall()
    },
  )
})
