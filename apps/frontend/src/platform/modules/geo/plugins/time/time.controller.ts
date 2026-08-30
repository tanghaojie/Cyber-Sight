import { reactive, readonly, type DeepReadonly } from 'vue'
import { ClockRange, ClockStep, JulianDate, type Clock, type Viewer } from 'cesium'

export interface GeoTimeState {
  startTime: number
  stopTime: number
  currentTime: number
  multiplier: number
  playing: boolean
}

export interface GeoTimeController {
  readonly state: DeepReadonly<GeoTimeState>
  togglePlayback(): void
  setPlaying(playing: boolean): void
  setMultiplier(multiplier: number): void
  setProgress(progress: number): void
  resetToNow(): void
  dispose(): void
}

interface ClockSnapshot {
  readonly startTime: JulianDate
  readonly stopTime: JulianDate
  readonly currentTime: JulianDate
  readonly multiplier: number
  readonly shouldAnimate: boolean
  readonly canAnimate: boolean
  readonly clockRange: ClockRange
  readonly clockStep: ClockStep
}

const DEFAULT_MULTIPLIER = 60
const UI_UPDATE_INTERVAL_MS = 100

function utcDayRange(date: Date): { start: JulianDate; stop: JulianDate } {
  const startDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0),
  )
  const start = JulianDate.fromDate(startDate)
  return {
    start,
    stop: JulianDate.addDays(start, 1, new JulianDate()),
  }
}

function cloneClock(clock: Clock): ClockSnapshot {
  return {
    startTime: JulianDate.clone(clock.startTime),
    stopTime: JulianDate.clone(clock.stopTime),
    currentTime: JulianDate.clone(clock.currentTime),
    multiplier: clock.multiplier,
    shouldAnimate: clock.shouldAnimate,
    canAnimate: clock.canAnimate,
    clockRange: clock.clockRange,
    clockStep: clock.clockStep,
  }
}

function toEpochMilliseconds(value: JulianDate): number {
  return JulianDate.toDate(value).getTime()
}

export function createGeoTimeController(viewer: Viewer): GeoTimeController {
  const clock = viewer.clock
  const original = cloneClock(clock)
  const now = new Date()
  const initialRange = utcDayRange(now)
  clock.startTime = JulianDate.clone(initialRange.start)
  clock.stopTime = JulianDate.clone(initialRange.stop)
  clock.currentTime = JulianDate.fromDate(now)
  clock.clockRange = ClockRange.LOOP_STOP
  clock.clockStep = ClockStep.SYSTEM_CLOCK_MULTIPLIER
  clock.multiplier = DEFAULT_MULTIPLIER
  clock.canAnimate = true
  clock.shouldAnimate = false

  const state = reactive<GeoTimeState>({
    startTime: toEpochMilliseconds(clock.startTime),
    stopTime: toEpochMilliseconds(clock.stopTime),
    currentTime: toEpochMilliseconds(clock.currentTime),
    multiplier: clock.multiplier,
    playing: clock.shouldAnimate,
  })
  let disposed = false
  let lastUiUpdate = 0

  function guard(): void {
    if (disposed) {
      throw new Error('Geo time controller has been disposed')
    }
  }

  function syncState(): void {
    state.startTime = toEpochMilliseconds(clock.startTime)
    state.stopTime = toEpochMilliseconds(clock.stopTime)
    state.currentTime = toEpochMilliseconds(clock.currentTime)
    state.multiplier = clock.multiplier
    state.playing = clock.shouldAnimate
  }

  function handleTick(): void {
    if (disposed || !clock.shouldAnimate) {
      return
    }
    viewer.scene.requestRender()
    const nowMs = performance.now()
    if (nowMs - lastUiUpdate >= UI_UPDATE_INTERVAL_MS) {
      lastUiUpdate = nowMs
      syncState()
    }
  }

  const removeTickListener = clock.onTick.addEventListener(handleTick)

  function setPlaying(playing: boolean): void {
    guard()
    clock.shouldAnimate = playing
    syncState()
    viewer.scene.requestRender()
  }

  function togglePlayback(): void {
    setPlaying(!clock.shouldAnimate)
  }

  function setMultiplier(multiplier: number): void {
    guard()
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      return
    }
    clock.multiplier = multiplier
    syncState()
  }

  function setProgress(progress: number): void {
    guard()
    const boundedProgress = Math.min(1, Math.max(0, progress))
    const duration = JulianDate.secondsDifference(clock.stopTime, clock.startTime)
    clock.currentTime = JulianDate.addSeconds(
      clock.startTime,
      duration * boundedProgress,
      new JulianDate(),
    )
    syncState()
    viewer.scene.requestRender()
  }

  function resetToNow(): void {
    guard()
    const currentDate = new Date()
    const range = utcDayRange(currentDate)
    clock.startTime = JulianDate.clone(range.start)
    clock.stopTime = JulianDate.clone(range.stop)
    clock.currentTime = JulianDate.fromDate(currentDate)
    syncState()
    viewer.scene.requestRender()
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    removeTickListener()
    clock.startTime = JulianDate.clone(original.startTime)
    clock.stopTime = JulianDate.clone(original.stopTime)
    clock.currentTime = JulianDate.clone(original.currentTime)
    clock.multiplier = original.multiplier
    clock.shouldAnimate = original.shouldAnimate
    clock.canAnimate = original.canAnimate
    clock.clockRange = original.clockRange
    clock.clockStep = original.clockStep
  }

  viewer.scene.requestRender()
  return {
    state: readonly(state),
    togglePlayback,
    setPlaying,
    setMultiplier,
    setProgress,
    resetToNow,
    dispose,
  }
}
