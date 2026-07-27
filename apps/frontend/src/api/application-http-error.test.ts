import { describe, expect, it, vi } from 'vitest'
import { createApplicationHttpErrorHandler, type ApplicationHttpErrorActions } from './application-http-error.js'

function actions(route = { name: 'users', fullPath: '/users' }) {
  const value: ApplicationHttpErrorActions = {
    currentRoute: () => route,
    clearSession: vi.fn(),
    clearNavigation: vi.fn(),
    clearRoutes: vi.fn(),
    replace: vi.fn().mockResolvedValue(undefined),
    showError: vi.fn(),
  }
  return value
}

describe('application HTTP error actions', () => {
  it('clears application state and redirects HTTP 401 to login', async () => {
    const deps = actions()
    await createApplicationHttpErrorHandler(deps)({ httpStatus: 401, err: 'expired' })
    expect(deps.clearSession).toHaveBeenCalledOnce()
    expect(deps.clearNavigation).toHaveBeenCalledOnce()
    expect(deps.clearRoutes).toHaveBeenCalledOnce()
    expect(deps.replace).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/users' } })
  })

  it('redirects HTTP 404 to the dedicated page', async () => {
    const deps = actions()
    await createApplicationHttpErrorHandler(deps)({ httpStatus: 404, err: 'missing' })
    expect(deps.replace).toHaveBeenCalledWith({ name: 'not-found', query: { from: '/users' } })
  })

  it('shows the backend error for HTTP 500', async () => {
    const deps = actions()
    await createApplicationHttpErrorHandler(deps)({ httpStatus: 500, err: 'Database unavailable' })
    expect(deps.showError).toHaveBeenCalledWith('Database unavailable')
  })
})
