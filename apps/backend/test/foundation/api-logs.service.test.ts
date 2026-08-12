import { describe, expect, it, vi } from 'vitest'
import { ApiLogWriter, type ApiLogEvent } from '@/foundation/modules/api-logs/api-logs.service.js'

function event(expiresAt: Date | null): ApiLogEvent {
  return {
    occurredAt: new Date('2026-08-05T00:00:00.000Z'),
    expiresAt,
    requestId: 'request-1',
    actorUserId: 1,
    actorUsername: 'admin',
    method: 'POST',
    routePattern: '/auth/login',
    httpStatus: 200,
    businessStatus: 0,
    durationMs: 1,
  }
}

describe('API log writer', () => {
  it('evicts a temporary event to make room for a permanent login event', async () => {
    const inserted: ApiLogEvent[] = []
    const logger = { error: vi.fn() }
    const writer = new ApiLogWriter(
      {
        async insert(events) {
          inserted.push(...events)
        },
        async deleteExpired() {
          return 0
        },
      },
      logger,
      { maxQueueSize: 1 },
    )

    writer.enqueue(event(new Date('2026-11-03T00:00:00.000Z')))
    writer.enqueue(event(null))
    await writer.flushNow()

    expect(inserted).toHaveLength(1)
    expect(inserted[0]?.expiresAt).toBeNull()
    expect(logger.error).toHaveBeenCalledOnce()
  })

  it('retains a failed batch in memory without throwing to the caller', async () => {
    const writer = new ApiLogWriter(
      {
        async insert() {
          throw new Error('database unavailable')
        },
        async deleteExpired() {
          return 0
        },
      },
      { error: vi.fn() },
    )
    writer.enqueue(event(null))

    await expect(writer.flushNow()).resolves.toBeUndefined()
    expect(writer.pendingCount()).toBe(1)
  })

  it('repeats retention batches until no further expired records remain', async () => {
    const deleteExpired = vi.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(0)
    const writer = new ApiLogWriter(
      {
        async insert() {},
        deleteExpired,
      },
      { error: vi.fn() },
      { retentionBatchSize: 2 },
    )

    await writer.runRetention()

    expect(deleteExpired).toHaveBeenCalledTimes(2)
    expect(deleteExpired).toHaveBeenNthCalledWith(1, 2)
  })
})
