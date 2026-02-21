import { customInstance } from './orval-mutator'

export type GuideDashboardSummary = {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  totalRevenue: number
  totalTourists: number
  totalCircuits: number
  upcomingSessions: number
}

export type GuideBookingResponse = {
  id: number
  circuitId: number
  circuitName: string
  circuitSessionId: number
  sessionStartDateTime: string
  sessionEndDateTime: string | null
  sessionStatus: string

  touristId: number
  touristName: string
  touristEmail: string
  touristPhone: string | null

  amountMad: number
  paymentStatus: string
  createdAt: string
  paidAt: string | null
}

export function getGuideSummary(signal?: AbortSignal) {
  return customInstance<GuideDashboardSummary>({
    url: '/api/guide/summary',
    method: 'GET',
    signal,
  })
}

export function getGuideBookings(signal?: AbortSignal) {
  return customInstance<GuideBookingResponse[]>({
    url: '/api/guide/bookings',
    method: 'GET',
    signal,
  })
}
