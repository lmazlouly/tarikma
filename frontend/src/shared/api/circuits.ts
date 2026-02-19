import { customInstance } from './orval-mutator'

export type CircuitSummary = {
  id: number
  cityId: number
  cityName: string | null
  name: string
  notes: string | null
  createdAt: string
  stopCount: number
}

export type CircuitStop = {
  id: number
  position: number
  dayNumber: number | null
  stopKind: string | null
  mealType: string | null
  startTime: string | null
  endTime: string | null
  durationMinutes: number | null
  notes: string | null
  placeId: number
  placeName: string
  placeCategory: string | null
  placeImage: string | null
  placeAddress: string | null
  placeLatitude: number | null
  placeLongitude: number | null
}

export type CircuitRoute = {
  id: number
  fromStopId: number
  toStopId: number
  transportOptionId: number | null
  transportMode: string | null
  distanceKm: number | null
  durationMinutes: number | null
}

export type Circuit = {
  id: number
  cityId: number
  cityName: string | null
  name: string
  notes: string | null
  createdAt: string
  createdBy: number
  stops: CircuitStop[]
  routes: CircuitRoute[]
}

export type CircuitPlanningWarning = {
  code: string
  message: string
  severity: string
  dayNumber: number | null
  stopId: number | null
}

export type CreateCircuitRequest = {
  cityId: number
  name: string
  notes?: string | null
}

export function listMyCircuits(cityId?: number, signal?: AbortSignal) {
  const qs = cityId != null ? `?cityId=${encodeURIComponent(cityId)}` : ''
  return customInstance<CircuitSummary[]>({ url: `/api/circuits${qs}`, method: 'GET', signal })
}

export function createCircuit(data: CreateCircuitRequest, signal?: AbortSignal) {
  return customInstance<Circuit>({
    url: `/api/circuits`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  })
}

export function getMyCircuit(id: number, signal?: AbortSignal) {
  return customInstance<Circuit>({ url: `/api/circuits/${id}`, method: 'GET', signal })
}

export function listCircuitPlanningWarnings(id: number, signal?: AbortSignal) {
  return customInstance<CircuitPlanningWarning[]>({
    url: `/api/circuits/${id}/planning-warnings`,
    method: 'GET',
    signal,
  })
}

export type AiGenerateCircuitRequest = {
  cityId: number
  numberOfDays: number
  interests?: string[]
  travelDate?: string
}

export function aiGenerateCircuit(data: AiGenerateCircuitRequest, signal?: AbortSignal) {
  return customInstance<Circuit>({
    url: `/api/circuits/ai-generate`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  })
}

export function aiReorderStops(id: number, signal?: AbortSignal) {
  return customInstance<Circuit>({
    url: `/api/circuits/${id}/ai-reorder`,
    method: 'POST',
    signal,
  })
}
