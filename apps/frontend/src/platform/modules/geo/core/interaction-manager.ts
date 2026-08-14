import { reactive, readonly } from 'vue'
import { createDisposableScope, type Disposable, type DisposableScope } from './disposable'

export interface GeoInteractionContext {
  readonly signal: AbortSignal
  readonly scope: DisposableScope
  complete(): void
}

export interface GeoInteractionDefinition {
  readonly id: string
  readonly cursor?: string
  start(context: GeoInteractionContext): Disposable | void
}

export interface GeoInteractionState {
  activeId?: string
  cursor?: string
}

export interface GeoInteractionManager extends Disposable {
  readonly state: Readonly<GeoInteractionState>
  activate(definition: GeoInteractionDefinition): void
  cancel(): void
}

interface ActiveInteraction {
  readonly definition: GeoInteractionDefinition
  readonly abortController: AbortController
  readonly scope: DisposableScope
}

export function createGeoInteractionManager(): GeoInteractionManager {
  const state = reactive<GeoInteractionState>({})
  let activeInteraction: ActiveInteraction | undefined

  function finish(active: ActiveInteraction): void {
    if (activeInteraction !== active) {
      return
    }
    activeInteraction = undefined
    state.activeId = undefined
    state.cursor = undefined
    active.abortController.abort()
    try {
      active.scope.dispose()
    } catch (error) {
      console.error('Failed to dispose Geo interaction resources', error)
    }
  }

  function cancel(): void {
    if (activeInteraction) {
      finish(activeInteraction)
    }
  }

  function activate(definition: GeoInteractionDefinition): void {
    cancel()
    const scope = createDisposableScope()
    const abortController = new AbortController()
    const active = { definition, abortController, scope }
    activeInteraction = active
    state.activeId = definition.id
    state.cursor = definition.cursor

    try {
      const resource = definition.start({
        signal: abortController.signal,
        scope,
        complete() {
          finish(active)
        },
      })
      if (resource) {
        scope.use(resource)
      }
    } catch (error) {
      finish(active)
      throw error
    }
  }

  function dispose(): void {
    cancel()
  }

  return {
    state: readonly(state),
    activate,
    cancel,
    dispose,
  }
}
