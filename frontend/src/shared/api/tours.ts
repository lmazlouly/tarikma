import { customInstance } from './orval-mutator'

// ── Tour types ──────────────────────────────────────────────

export type TourSummary = {
  id: number
  name: string
  notes: string | null
  priceMad: number | null
  cityId: number
  cityName: string | null
  stopCount: number
  guideName: string
  nextSessionAt: string | null
  upcomingSessionCount: number
}

export type TourStop = {
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

export type TourSession = {
  id: number
  startDateTime: string
  endDateTime: string | null
  maxParticipants: number | null
  bookedCount: number
  availablePlaces: number
  status: string
  userBooked: boolean
}

export type TourDetail = {
  id: number
  name: string
  notes: string | null
  priceMad: number | null
  cityId: number
  cityName: string | null
  guideName: string
  stops: TourStop[]
  sessions: TourSession[]
}

export type BookingResponse = {
  id: number
  circuitSessionId: number
  circuitId: number
  tourName: string
  sessionStartDateTime: string
  amountMad: number
  status: string
  createdAt: string
  paidAt: string | null
}

// ── API functions ───────────────────────────────────────────

export function listTours(cityId?: number, signal?: AbortSignal) {
  const qs = cityId != null ? `?cityId=${encodeURIComponent(cityId)}` : ''
  return customInstance<TourSummary[]>({ url: `/api/tours${qs}`, method: 'GET', signal })
}

export function getTourDetail(id: number, signal?: AbortSignal) {
  return customInstance<TourDetail>({ url: `/api/tours/${id}`, method: 'GET', signal })
}

export function createCheckout(sessionId: number, signal?: AbortSignal) {
  return customInstance<{ checkoutUrl: string }>({
    url: `/api/bookings/checkout`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { sessionId },
    signal,
  })
}

export function getMyBookings(signal?: AbortSignal) {
  return customInstance<BookingResponse[]>({ url: `/api/bookings/mine`, method: 'GET', signal })
}

export function getBookingByCheckoutId(checkoutId: string, signal?: AbortSignal) {
  return customInstance<BookingResponse>({
    url: `/api/bookings/by-checkout?checkoutId=${encodeURIComponent(checkoutId)}`,
    method: 'GET',
    signal,
  })
}
