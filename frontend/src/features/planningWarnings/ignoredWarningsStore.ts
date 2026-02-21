import type { CircuitPlanningWarning } from './types'

const STORAGE_KEY = 'ignoredPlanningWarnings'
const EVENT_NAME = 'ignoredPlanningWarningsChanged'

export function warningKey(circuitId: number, w: Pick<CircuitPlanningWarning, 'code' | 'dayNumber' | 'stopId'>) {
  const day = w.dayNumber == null ? 'null' : String(w.dayNumber)
  const stop = w.stopId == null ? 'null' : String(w.stopId)
  return `${circuitId}:${w.code}:${day}:${stop}`
}

function readRaw(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is string => typeof v === 'string')
  } catch {
    return []
  }
}

function writeRaw(keys: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

export function getIgnoredWarningKeys(): Set<string> {
  return new Set(readRaw())
}

export function ignoreWarning(key: string) {
  const keys = readRaw()
  if (keys.includes(key)) return
  keys.push(key)
  writeRaw(keys)
}

export function unignoreWarning(key: string) {
  const keys = readRaw().filter((k) => k !== key)
  writeRaw(keys)
}

export function isIgnored(key: string): boolean {
  return getIgnoredWarningKeys().has(key)
}

export function subscribeIgnoredWarnings(callback: () => void) {
  const onCustom = () => callback()
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback()
  }

  window.addEventListener(EVENT_NAME, onCustom)
  window.addEventListener('storage', onStorage)

  return () => {
    window.removeEventListener(EVENT_NAME, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}
