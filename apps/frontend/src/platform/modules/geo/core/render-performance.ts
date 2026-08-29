import type { Viewer } from 'cesium'
import type { Disposable } from './disposable'

const MINIMUM_RESOLUTION_SCALE = 0.6
const TARGET_RENDER_PIXELS = 1_600_000
const LOW_FRAME_RATE = 28
const HIGH_FRAME_RATE = 50
const FRAME_SAMPLE_SIZE = 20
const IDLE_FRAME_GAP_MS = 250
const ADJUSTMENT_COOLDOWN_MS = 1_500
const SCALE_DOWN_STEP = 0.1
const SCALE_UP_STEP = 0.05

function clampScale(value: number): number {
  return Math.min(1, Math.max(MINIMUM_RESOLUTION_SCALE, value))
}

function roundedScale(value: number): number {
  return Math.round(clampScale(value) * 100) / 100
}

function resolutionScaleLimit(viewer: Viewer): number {
  const canvas = viewer.scene.canvas
  const cssPixels = Math.max(canvas.clientWidth * canvas.clientHeight, 1)
  return roundedScale(Math.sqrt(TARGET_RENDER_PIXELS / cssPixels))
}

function applyResolutionScale(viewer: Viewer, value: number): boolean {
  const nextScale = roundedScale(value)
  if (Math.abs(viewer.resolutionScale - nextScale) < 0.001) {
    return false
  }
  viewer.resolutionScale = nextScale
  viewer.resize()
  viewer.scene.requestRender()
  return true
}

export function createGeoRenderPerformanceController(viewer: Viewer): Disposable {
  let scaleLimit = resolutionScaleLimit(viewer)
  let lastFrameAt: number | undefined
  let sampleStartedAt: number | undefined
  let sampleFrames = 0
  let lastAdjustmentAt = 0
  let disposed = false

  applyResolutionScale(viewer, Math.min(viewer.resolutionScale, scaleLimit))

  function resetSample(): void {
    lastFrameAt = undefined
    sampleStartedAt = undefined
    sampleFrames = 0
  }

  function handlePostRender(): void {
    if (disposed || document.hidden) {
      resetSample()
      return
    }
    const now = performance.now()
    if (lastFrameAt === undefined || now - lastFrameAt > IDLE_FRAME_GAP_MS) {
      lastFrameAt = now
      sampleStartedAt = now
      sampleFrames = 0
      return
    }
    lastFrameAt = now
    sampleFrames += 1
    if (sampleFrames < FRAME_SAMPLE_SIZE || sampleStartedAt === undefined) {
      return
    }

    const elapsed = now - sampleStartedAt
    const framesPerSecond = elapsed > 0 ? (sampleFrames * 1000) / elapsed : HIGH_FRAME_RATE
    if (now - lastAdjustmentAt >= ADJUSTMENT_COOLDOWN_MS) {
      if (framesPerSecond < LOW_FRAME_RATE) {
        if (applyResolutionScale(viewer, viewer.resolutionScale - SCALE_DOWN_STEP)) {
          lastAdjustmentAt = now
        }
      } else if (framesPerSecond > HIGH_FRAME_RATE && viewer.resolutionScale < scaleLimit) {
        if (
          applyResolutionScale(viewer, Math.min(viewer.resolutionScale + SCALE_UP_STEP, scaleLimit))
        ) {
          lastAdjustmentAt = now
        }
      }
    }
    sampleStartedAt = now
    sampleFrames = 0
  }

  function handleResize(): void {
    if (disposed) {
      return
    }
    scaleLimit = resolutionScaleLimit(viewer)
    if (viewer.resolutionScale > scaleLimit) {
      applyResolutionScale(viewer, scaleLimit)
    } else {
      viewer.resize()
      viewer.scene.requestRender()
    }
    resetSample()
  }

  const removePostRenderListener = viewer.scene.postRender.addEventListener(handlePostRender)
  window.addEventListener('resize', handleResize)

  return {
    dispose() {
      if (disposed) {
        return
      }
      disposed = true
      removePostRenderListener()
      window.removeEventListener('resize', handleResize)
    },
  }
}
