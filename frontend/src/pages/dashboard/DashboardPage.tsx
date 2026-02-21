import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../app/auth/AuthContext'
import { getMyBookings } from '../../shared/api/tours'
import type { BookingResponse } from '../../shared/api/tours'

export function DashboardPage() {
  const { email, fullName, roles, hasRole } = useAuth()

  const initials = (fullName ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const roleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'badge-ocean'
      case 'GUIDE': return 'badge-guide'
      case 'COMPANY_OWNER':
      case 'COMPANY_STAFF': return 'badge-gold'
      default: return 'badge-ocean'
    }
  }

  const quickLinks: { label: string; desc: string; icon: string; to: string; show: boolean }[] = [
    { label: 'Plan a Trip', desc: 'Build a day-by-day itinerary', icon: 'mdi:map-outline', to: '/plan', show: true },
    { label: 'My Circuits', desc: 'Keep your saved routes handy', icon: 'mdi:map-marker-path', to: '/circuits', show: true },
    { label: 'Admin Panel', desc: 'Manage users, companies and more', icon: 'mdi:shield-crown-outline', to: '/admin', show: hasRole('ADMIN') },
    { label: 'Guide Dashboard', desc: 'Manage your guide profile', icon: 'mdi:compass-outline', to: '/guide', show: hasRole('GUIDE') },
    { label: 'Company Dashboard', desc: 'Manage your company', icon: 'mdi:domain', to: '/company', show: hasRole('COMPANY_OWNER') },
  ]

  const visibleLinks = quickLinks.filter((l) => l.show)

  const bookingsQuery = useQuery({
    queryKey: ['my-bookings'],
    queryFn: ({ signal }) => getMyBookings(signal),
  })
  const bookings = bookingsQuery.data ?? []

  return (
    <section className="px-4 py-10 md:py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border border-brand-sand/60 bg-gradient-to-br from-brand-sand/40 via-white to-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-ocean text-2xl font-bold text-white shadow-lg shadow-brand-ocean/20">
                {initials}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  Tourist Dashboard
                </div>
                <h1 className="text-3xl font-semibold text-gray-900">
                  Welcome back, {fullName?.split(' ')[0] ?? 'there'}
                </h1>
                <p className="text-sm text-gray-500">{email}</p>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map((r) => (
                    <span key={r} className={roleBadge(r)}>{r}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/plan"
                className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Icon icon="mdi:rocket-launch-outline" className="text-lg" />
                Start a plan
              </Link>
              <Link
                to="/circuits"
                className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Icon icon="mdi:map-marker-path" className="text-lg" />
                View circuits
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {visibleLinks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-700">Quick Actions</h2>
                  <span className="text-xs text-gray-400">Tailored for your roles</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {visibleLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="group card flex h-full flex-col gap-4 p-5 no-underline transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-sand text-brand-ocean">
                          <Icon icon={link.icon} className="text-xl" />
                        </div>
                        <Icon
                          icon="mdi:arrow-top-right"
                          className="text-lg text-gray-300 transition group-hover:text-brand-ocean"
                        />
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-900">{link.label}</div>
                        <div className="text-xs text-gray-500">{link.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* My Bookings */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700">My Tour Bookings</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Tours you've booked or are pending payment.</p>
                </div>
                <Link to="/tours" className="text-xs text-brand-ocean hover:underline no-underline">Browse tours</Link>
              </div>

              {bookingsQuery.isLoading && (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Icon icon="mdi:loading" className="animate-spin text-xl" />
                </div>
              )}

              {!bookingsQuery.isLoading && bookings.length === 0 && (
                <div className="text-center py-8">
                  <Icon icon="mdi:ticket-outline" className="mx-auto text-4xl text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No bookings yet.</p>
                  <Link to="/tours" className="mt-2 inline-block text-sm text-brand-ocean hover:underline no-underline">
                    Explore tours →
                  </Link>
                </div>
              )}

              {bookings.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {bookings.map((b: BookingResponse) => {
                    const sessionDate = new Date(b.sessionStartDateTime)
                    const isConfirmed = b.status === 'CONFIRMED'
                    const isPending = b.status === 'PENDING'
                    const now = Date.now()
                    const diffMs = sessionDate.getTime() - now
                    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                    const isPast = daysLeft <= 0
                    return (
                      <div key={b.id} className="flex items-center gap-3 py-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                          isConfirmed ? 'bg-brand-success/10 text-brand-success' : isPending ? 'bg-brand-warning/10 text-brand-warning' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon icon={isConfirmed ? 'mdi:check-circle' : isPending ? 'mdi:clock-outline' : 'mdi:close-circle'} className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/tours/${b.circuitId}`} className="text-sm font-medium text-gray-900 hover:text-brand-ocean no-underline truncate block">
                            {b.tourName}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-gray-500">
                              {sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' '}at {sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                              isConfirmed ? 'bg-green-100 text-green-700' : isPending ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {b.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
                          <span className="text-sm font-bold text-brand-gold">{b.amountMad} MAD</span>
                          {isPast ? (
                            <span className="text-[10px] text-gray-400">Completed</span>
                          ) : daysLeft === 1 ? (
                            <span className="text-[10px] font-semibold text-brand-error">Tomorrow!</span>
                          ) : daysLeft <= 3 ? (
                            <span className="text-[10px] font-semibold text-brand-warning">{daysLeft} days left</span>
                          ) : (
                            <span className="text-[10px] text-gray-400">{daysLeft} days left</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700">Account Snapshot</h2>
                  <p className="mt-1 text-xs text-gray-500">Everything you need before you travel.</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sand text-brand-ocean">
                  <Icon icon="mdi:account-circle-outline" className="text-lg" />
                </div>
              </div>
              <div className="mt-4 divide-y divide-gray-100">
                <InfoRow icon="mdi:account-outline" label="Full Name" value={fullName ?? '—'} />
                <InfoRow icon="mdi:email-outline" label="Email" value={email ?? '—'} />
                <InfoRow
                  icon="mdi:shield-check-outline"
                  label="Roles"
                  value={roles.length > 0 ? roles.join(', ') : 'No roles assigned'}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-sand p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-ocean shadow-sm">
                  <Icon icon="mdi:sun-compass" className="text-xl" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-brand-ocean">Ready for your next escape?</div>
                  <p className="mt-1 text-xs text-gray-500">
                    Use the planner to organize routes, stops, and travel time.
                  </p>
                </div>
              </div>
              <Link
                to="/plan"
                className="btn-accent mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <Icon icon="mdi:calendar-blank" className="text-lg" />
                Build itinerary
              </Link>
            </div>

            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-700">Travel Essentials</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Icon icon="mdi:check-circle-outline" className="mt-0.5 text-brand-gold" />
                  Save circuits before you share them with companions.
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="mdi:check-circle-outline" className="mt-0.5 text-brand-gold" />
                  Keep transport options nearby for quick route decisions.
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="mdi:check-circle-outline" className="mt-0.5 text-brand-gold" />
                  Check your profile to ensure your contact info is current.
                </li>
              </ul>
            </div>

            <div className="card-sand p-5 flex items-start gap-3">
              <Icon icon="mdi:information-outline" className="mt-0.5 text-xl text-brand-gold flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-brand-ocean">Need help?</div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Contact our support team or visit the help center for assistance with your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon icon={icon} className="text-lg text-gray-400 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm text-gray-900">{value}</div>
      </div>
    </div>
  )
}
