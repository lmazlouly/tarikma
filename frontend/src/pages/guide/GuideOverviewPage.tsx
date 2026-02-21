import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { getGuideSummary } from '../../shared/api/guide'

export function GuideOverviewPage() {
  const summaryQuery = useQuery({
    queryKey: ['guide-summary'],
    queryFn: ({ signal }) => getGuideSummary(signal),
  })

  const summary = summaryQuery.data

  const stats = summary
    ? [
        { label: 'Total Bookings', value: summary.totalBookings, icon: 'mdi:ticket-outline', color: 'text-brand-ocean' },
        { label: 'Confirmed', value: summary.confirmedBookings, icon: 'mdi:check-circle-outline', color: 'text-brand-success' },
        { label: 'Pending', value: summary.pendingBookings, icon: 'mdi:clock-outline', color: 'text-brand-warning' },
        { label: 'Revenue', value: `${summary.totalRevenue} MAD`, icon: 'mdi:cash-multiple', color: 'text-brand-gold' },
        { label: 'Tourists', value: summary.totalTourists, icon: 'mdi:account-group-outline', color: 'text-role-guide' },
        { label: 'Circuits', value: summary.totalCircuits, icon: 'mdi:map-marker-path', color: 'text-brand-ocean' },
        { label: 'Upcoming Sessions', value: summary.upcomingSessions, icon: 'mdi:calendar-clock', color: 'text-brand-ocean-light' },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Guide Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Overview of your tours, bookings, and revenue.</p>
      </div>

      {summaryQuery.isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icon icon="mdi:loading" className="animate-spin text-lg" />
          Loading summary…
        </div>
      )}

      {summaryQuery.isError && (
        <div className="alert-error">Failed to load dashboard summary.</div>
      )}

      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-4">
              <div className="flex items-center gap-2">
                <Icon icon={stat.icon} className={`text-xl ${stat.color}`} />
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{stat.label}</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
