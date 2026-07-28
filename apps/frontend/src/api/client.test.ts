import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAccessToken } from './access-token.js'
import { apiClient } from './client.js'

afterEach(() => {
  clearAccessToken()
  vi.unstubAllGlobals()
})

describe('API client', () => {
  it('serializes query parameters and unwraps a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 0, data: { value: 'ok' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiClient.GET<{
      status: 0
      data: { value: string }
    }>('/example', {
      query: { pageNum: 2, keyword: 'hello world' },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/example?pageNum=2&keyword=hello+world',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual({
      data: { status: 0, data: { value: 'ok' } },
    })
  })

  it('sends typed JSON and separates a business error from success data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 1001, err: 'Invalid request' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiClient.POST<{ status: 0 }, { username: string }>('/example', {
      body: { username: 'admin' },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/example',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'admin' }),
      }),
    )
    expect(result).toEqual({
      error: { status: 1001, err: 'Invalid request' },
    })
  })

  it('adds the persisted access token as a bearer authorization header', async () => {
    setAccessToken('signed.jwt.token')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 0 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await apiClient.GET<{ status: 0 }>('/protected')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/protected',
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: 'Bearer signed.jwt.token',
        }),
      }),
    )
  })
})
