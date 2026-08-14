export interface Disposable {
  dispose(): void
}

export interface DisposableScope extends Disposable {
  readonly disposed: boolean
  use<T extends Disposable>(resource: T): T
  defer(cleanup: () => void): void
  child(): DisposableScope
}

export function createDisposableScope(): DisposableScope {
  let disposed = false
  const cleanups: Array<() => void> = []

  function defer(cleanup: () => void): void {
    if (disposed) {
      cleanup()
      return
    }
    cleanups.push(cleanup)
  }

  function use<T extends Disposable>(resource: T): T {
    defer(function disposeResource() {
      resource.dispose()
    })
    return resource
  }

  function child(): DisposableScope {
    return use(createDisposableScope())
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    const errors: unknown[] = []
    while (cleanups.length) {
      const cleanup = cleanups.pop()
      try {
        cleanup?.()
      } catch (error) {
        errors.push(error)
      }
    }
    if (errors.length) {
      throw new AggregateError(errors, 'One or more Geo resources could not be disposed')
    }
  }

  return {
    get disposed() {
      return disposed
    },
    use,
    defer,
    child,
    dispose,
  }
}
