import { customInstance } from './orval-mutator'

export type CircuitSummary = {
  id: number
  cityId: number
  cityName: string | null
  name: string
  notes: string | null
  priceMad: number | null
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
  priceMad: number | null
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
  priceMad?: number | null
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

export type AiSuggestPlacesRequest = {
  count?: number
  preferences?: string
}

export function aiSuggestPlaces(id: number, data: AiSuggestPlacesRequest, signal?: AbortSignal) {
  return customInstance<Circuit>({
    url: `/api/circuits/${id}/ai-suggest-places`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  })
}

export type UpdateCircuitRequest = {
  name?: string
  notes?: string
  priceMad?: number
}

export function updateCircuit(id: number, data: UpdateCircuitRequest, signal?: AbortSignal) {
  return customInstance<Circuit>({
    url: `/api/circuits/${id}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  })
}

// ── Circuit Sessions ────────────────────────────────────────

export type CircuitSession = {
  id: number
  circuitId: number
  startDateTime: string
  endDateTime: string | null
  maxParticipants: number | null
  notes: string | null
  status: string
  createdAt: string
}

export type CreateCircuitSessionRequest = {
  startDateTime: string
  endDateTime?: string | null
  maxParticipants?: number | null
  notes?: string | null
}

export type UpdateCircuitSessionRequest = {
  startDateTime?: string
  endDateTime?: string
  maxParticipants?: number
  notes?: string
  status?: string
}

export function listSessions(circuitId: number, signal?: AbortSignal) {
  return customInstance<CircuitSession[]>({
    url: `/api/circuits/${circuitId}/sessions`,
    method: 'GET',
    signal,
  })
}

export function createSession(circuitId: number, data: CreateCircuitSessionRequest, signal?: AbortSignal) {
  return customInstance<CircuitSession>({
    url: `/api/circuits/${circuitId}/sessions`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  })
}

export function updateSession(circuitId: number, sessionId: number, data: UpdateCircuitSessionRequest, signal?: AbortSignal) {
  return customInstance<CircuitSession>({
    url: `/api/circuits/${circuitId}/sessions/${sessionId}`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    data,
    signal,
  })
}

export function deleteSession(circuitId: number, sessionId: number, signal?: AbortSignal) {
  return customInstance<void>({
    url: `/api/circuits/${circuitId}/sessions/${sessionId}`,
    method: 'DELETE',
    signal,
  })
}
