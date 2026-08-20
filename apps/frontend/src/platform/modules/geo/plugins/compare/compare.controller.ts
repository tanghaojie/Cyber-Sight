import { markRaw, reactive, readonly } from 'vue'
import { ImageryProvider, type Viewer } from 'cesium'
import type { Disposable } from '../../core/disposable'
import {
  SceneCompareTool,
  type SceneCompareOptions,
  type SceneCompareSession,
} from '../../tools/compare/scene-compare'

export interface CompareState {
  enabled: boolean
  splitPosition: number
  layers: readonly CompareLayerOption[]
  error?: string
}

export interface CompareLayerOption {
  readonly index: number
  readonly label: string
}

export interface CompareController extends Disposable {
  readonly state: Readonly<CompareState>
  enable(options: SceneCompareOptions): void
  enableWithProviders(left: ImageryProvider, right: ImageryProvider): void
  enableLayerComparison(leftIndex: number, rightIndex: number): void
  refreshLayers(): void
  setSplitPosition(value: number): void
  setEnabled(enabled: boolean): void
  disable(): void
}

export interface CompareControllerOptions {
  readonly getLayerName?: (index: number) => string | undefined
}

export function createCompareController(
  viewer: Viewer,
  options: CompareControllerOptions = {},
): CompareController {
  const tool = markRaw(new SceneCompareTool(viewer))
  const state = reactive<CompareState>({ enabled: false, splitPosition: 0.5, layers: [] })
  let session: SceneCompareSession | undefined

  function refreshLayers(): void {
    state.layers = Array.from({ length: viewer.imageryLayers.length }, (_, index) => ({
      index,
      label: options.getLayerName?.(index) ?? `图层 ${index + 1}`,
    }))
  }

  function enable(options: SceneCompareOptions): void {
    try {
      session?.stop()
      session = tool.enable({
        ...options,
        splitPosition: options.splitPosition ?? state.splitPosition,
      })
      state.enabled = true
      state.splitPosition = options.splitPosition ?? state.splitPosition
      state.error = undefined
    } catch (error) {
      state.enabled = false
      state.error = error instanceof Error ? error.message : 'Scene comparison failed'
    }
  }

  function enableWithProviders(left: ImageryProvider, right: ImageryProvider): void {
    enable({ leftProvider: left, rightProvider: right })
  }

  function enableLayerComparison(leftIndex: number, rightIndex: number): void {
    if (leftIndex === rightIndex) {
      state.error = '左右图层必须不同'
      return
    }
    if (
      leftIndex < 0 ||
      rightIndex < 0 ||
      leftIndex >= viewer.imageryLayers.length ||
      rightIndex >= viewer.imageryLayers.length
    ) {
      state.error = '选择的影像图层不存在'
      return
    }
    const leftLayer = viewer.imageryLayers.get(leftIndex)
    const rightLayer = viewer.imageryLayers.get(rightIndex)
    enable({ leftLayer, rightLayer })
  }

  function setSplitPosition(value: number): void {
    if (!Number.isFinite(value)) {
      state.error = '分屏位置必须是有效数字'
      return
    }
    const nextValue = Math.min(Math.max(value, 0), 1)
    state.splitPosition = nextValue
    try {
      session?.setSplitPosition(nextValue)
    } catch (error) {
      state.error = error instanceof Error ? error.message : '分屏位置设置失败'
    }
  }

  function setEnabled(enabled: boolean): void {
    session?.setEnabled(enabled)
    state.enabled = enabled
  }

  function disable(): void {
    session?.stop()
    session = undefined
    state.enabled = false
  }

  function dispose(): void {
    disable()
    tool.dispose()
  }

  refreshLayers()
  return {
    state: readonly(state),
    enable,
    enableWithProviders,
    enableLayerComparison,
    refreshLayers,
    setSplitPosition,
    setEnabled,
    disable,
    dispose,
  }
}
