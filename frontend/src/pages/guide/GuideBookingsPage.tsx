import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { getGuideBookings } from '../../shared/api/guide'
import type { GuideBookingResponse } from '../../shared/api/guide'

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}

type FilterStatus = 'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED'

export function GuideBookingsPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const bookingsQuery = useQuery({
    queryKey: ['guide-bookings'],
    queryFn: ({ signal }) => getGuideBookings(signal),
  })

  const bookings = bookingsQuery.data ?? []

  const filtered = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.paymentStatus === filterStatus)

  const totalRevenue = filtered
    .filter((b) => b.paymentStatus === 'CONFIRMED')
    .reduce((sum, b) => sum + b.amountMad, 0)

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Bookings & Payments</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage all bookings for your circuits. View tourist details and payment status.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {(['ALL', 'CONFIRMED', 'PENDING', 'CANCELLED'] as FilterStatus[]).map((status) => {
          const count = status === 'ALL' ? bookings.length : bookings.filter((b) => b.paymentStatus === status).length
          const active = filterStatus === status
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-brand-ocean text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-ocean hover:text-brand-ocean'
              }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
                {count}
              </span>
            </button>
          )
        })}

        {totalRevenue > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-gold-hover">
            <Icon icon="mdi:cash-multiple" className="text-sm" />
            Revenue: {totalRevenue.toFixed(2)} MAD
          </span>
        )}
      </div>

      {bookingsQuery.isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon icon="mdi:loading" className="animate-spin text-lg" />
          Loading bookings…
        </div>
      )}

      {bookingsQuery.isError && (
        <div className="alert-error">Failed to load bookings.</div>
      )}

      {!bookingsQuery.isLoading && filtered.length === 0 && (
        <div className="card p-8 text-center">
          <Icon icon="mdi:ticket-outline" className="mx-auto text-4xl text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">
            {bookings.length === 0 ? 'No bookings yet. Tourists will appear here once they book your circuits.' : 'No bookings match this filter.'}
          </p>
        </div>
      )}

      {/* Bookings Table (desktop) / Cards (mobile) */}
      {filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">Tourist</th>
                  <th className="px-4 py-3">Circuit</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => (
                  <TableRow key={b.id} booking={b} expanded={expandedId === b.id} onToggle={() => toggleExpand(b.id)} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((b) => (
              <MobileCard key={b.id} booking={b} expanded={expandedId === b.id} onToggle={() => toggleExpand(b.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function TableRow({ booking: b, expanded, onToggle }: { booking: GuideBookingResponse; expanded: boolean; onToggle: () => void }) {
  const statusStyle = STATUS_STYLES[b.paymentStatus] ?? 'bg-gray-100 text-gray-600'

  return (
    <>
      <tr
        className="cursor-pointer transition hover:bg-gray-50/50"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-role-guide/10">
              <Icon icon="mdi:account-outline" className="text-base text-role-guide" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">{b.touristName}</div>
              <div className="text-xs text-gray-400 truncate">{b.touristEmail}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-700">{b.circuitName}</td>
        <td className="px-4 py-3">
          <div className="text-gray-700">{formatDateTime(b.sessionStartDateTime)}</div>
          <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
            b.sessionStatus === 'SCHEDULED' ? 'bg-blue-50 text-blue-600' :
            b.sessionStatus === 'COMPLETED' ? 'bg-green-50 text-green-600' :
            'bg-gray-100 text-gray-500'
          }`}>
            {b.sessionStatus}
          </span>
        </td>
        <td className="px-4 py-3 font-semibold text-gray-900">{b.amountMad} MAD</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${statusStyle}`}>
            {b.paymentStatus}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500">{formatDate(b.createdAt)}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-brand-sand-light/40 px-6 py-4">
            <TouristDetail booking={b} />
          </td>
        </tr>
      )}
    </>
  )
}

function MobileCard({ booking: b, expanded, onToggle }: { booking: GuideBookingResponse; expanded: boolean; onToggle: () => void }) {
  const statusStyle = STATUS_STYLES[b.paymentStatus] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={onToggle}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-role-guide/10">
          <Icon icon="mdi:account-outline" className="text-lg text-role-guide" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-gray-900 truncate">{b.touristName}</span>
            <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusStyle}`}>
              {b.paymentStatus}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-gray-500">{b.circuitName}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Icon icon="mdi:calendar" className="text-sm" />
              {formatDateTime(b.sessionStartDateTime)}
            </span>
            <span className="font-semibold text-gray-700">{b.amountMad} MAD</span>
          </div>
        </div>
        <Icon
          icon={expanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
          className="mt-1 flex-shrink-0 text-lg text-gray-400"
        />
      </button>
      {expanded && (
        <div className="border-t border-gray-100 bg-brand-sand-light/40 px-4 py-3">
          <TouristDetail booking={b} />
        </div>
      )}
    </div>
  )
}

function TouristDetail({ booking: b }: { booking: GuideBookingResponse }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Tourist Information</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="mdi:account-outline" className="text-base text-gray-400" />
            <span className="text-gray-900">{b.touristName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="mdi:email-outline" className="text-base text-gray-400" />
            <a href={`mailto:${b.touristEmail}`} className="text-brand-ocean hover:text-brand-ocean-hover no-underline">
              {b.touristEmail}
            </a>
          </div>
          {b.touristPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Icon icon="mdi:phone-outline" className="text-base text-gray-400" />
              <a href={`tel:${b.touristPhone}`} className="text-brand-ocean hover:text-brand-ocean-hover no-underline">
                {b.touristPhone}
              </a>
            </div>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Payment Details</h4>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-gray-900">{b.amountMad} MAD</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[b.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
              {b.paymentStatus}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Booked</span>
            <span className="text-gray-700">{formatDate(b.createdAt)}</span>
          </div>
          {b.paidAt && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Paid</span>
              <span className="text-gray-700">{formatDate(b.paidAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
