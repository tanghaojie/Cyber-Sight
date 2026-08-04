export interface ApiLogEvent {
  occurredAt: Date
  expiresAt: Date | null
  requestId: string
  actorUserId: number | null
  actorUsername: string | null
  method: string
  routePattern: string
  httpStatus: number
  businessStatus: number | null
  durationMs: number
}

export interface ApiLogRepository {
  insert(events: ApiLogEvent[]): Promise<void>
  deleteExpired(batchSize: number): Promise<number>
}

interface ApiLogLogger {
  error(bindings: object, message?: string): void
}

interface ApiLogWriterOptions {
  batchSize?: number
  flushDelayMs?: number
  maxQueueSize?: number
  retentionBatchSize?: number
  retentionIntervalMs?: number
  retentionMaxBatches?: number
}

const defaultOptions = {
  batchSize: 100,
  flushDelayMs: 250,
  maxQueueSize: 5_000,
  retentionBatchSize: 1_000,
  retentionIntervalMs: 24 * 60 * 60 * 1_000,
  retentionMaxBatches: 10,
}

/**
 * 有界队列把日志数据库故障与业务请求隔离开。普通日志满载时优先被丢弃，永久登录日志尽力保留。
 */
export class ApiLogWriter {
  private readonly options: Required<ApiLogWriterOptions>
  private readonly queue: ApiLogEvent[] = []
  private flushTimer: NodeJS.Timeout | undefined
  private retentionTimer: NodeJS.Timeout | undefined
  private started = false
  private flushing = false
  private lastErrorAt = 0

  public constructor(
    private readonly repository: ApiLogRepository,
    private readonly logger: ApiLogLogger,
    options: ApiLogWriterOptions = {},
  ) {
    this.options = { ...defaultOptions, ...options }
  }

  public enqueue(event: ApiLogEvent): void {
    if (this.queue.length >= this.options.maxQueueSize && !this.makeRoomFor(event)) {
      this.reportError('api log queue full; event dropped', { queueSize: this.queue.length })
      return
    }
    this.queue.push(event)
    if (this.started) {
      this.scheduleFlush(this.options.flushDelayMs)
    }
  }

  /** 仅在 Fastify 实际监听后启动后台工作，避免 inject 测试意外连接数据库。 */
  public start(): void {
    if (this.started) {
      return
    }
    this.started = true
    this.scheduleFlush(this.options.flushDelayMs)
    void this.runRetention()
    this.retentionTimer = setInterval(() => {
      void this.runRetention()
    }, this.options.retentionIntervalMs)
    this.retentionTimer.unref()
  }

  public async stop(): Promise<void> {
    if (!this.started) {
      // inject 测试从不启动后台写入器；丢弃内存事件，不能在关闭时意外发起真实数据库连接。
      this.queue.length = 0
      return
    }
    this.started = false
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = undefined
    }
    if (this.retentionTimer) {
      clearInterval(this.retentionTimer)
      this.retentionTimer = undefined
    }
    await this.flushBeforeClose()
    this.queue.length = 0
  }

  public async flushNow(): Promise<void> {
    if (this.flushing || this.queue.length === 0) {
      return
    }
    this.flushing = true
    const batch = this.queue.splice(0, this.options.batchSize)
    try {
      await this.repository.insert(batch)
    } catch (error) {
      this.queue.unshift(...batch)
      this.reportError('api log batch persistence failed', {
        err: error,
        queueSize: this.queue.length,
      })
    } finally {
      this.flushing = false
    }
    if (this.started && this.queue.length > 0) {
      this.scheduleFlush(this.options.flushDelayMs)
    }
  }

  public async runRetention(): Promise<void> {
    try {
      for (let batch = 0; batch < this.options.retentionMaxBatches; batch += 1) {
        const deleted = await this.repository.deleteExpired(this.options.retentionBatchSize)
        if (deleted < this.options.retentionBatchSize) {
          break
        }
      }
    } catch (error) {
      this.reportError('api log retention cleanup failed', { err: error })
    }
  }

  public pendingCount(): number {
    return this.queue.length
  }

  private makeRoomFor(event: ApiLogEvent): boolean {
    if (event.expiresAt !== null) {
      return false
    }
    const temporaryIndex = this.queue.findIndex((queued) => queued.expiresAt !== null)
    if (temporaryIndex < 0) {
      return false
    }
    this.queue.splice(temporaryIndex, 1)
    this.reportError('api log queue full; temporary event evicted', {
      queueSize: this.queue.length,
    })
    return true
  }

  private scheduleFlush(delayMs: number): void {
    if (this.flushTimer || this.queue.length === 0) {
      return
    }
    this.flushTimer = setTimeout(() => {
      this.flushTimer = undefined
      void this.flushNow()
    }, delayMs)
    this.flushTimer.unref()
  }

  private async flushBeforeClose(): Promise<void> {
    let timeout: NodeJS.Timeout | undefined
    await Promise.race([
      this.flushNow(),
      new Promise<void>((resolve) => {
        timeout = setTimeout(resolve, 1_000)
        timeout.unref()
      }),
    ])
    if (timeout) {
      clearTimeout(timeout)
    }
  }

  private reportError(message: string, bindings: object): void {
    const now = Date.now()
    if (now - this.lastErrorAt < 60_000) {
      return
    }
    this.lastErrorAt = now
    this.logger.error(bindings, message)
  }
}
