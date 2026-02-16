import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../app/auth/AuthContext'

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
    { label: 'Admin Panel', desc: 'Manage users, companies and more', icon: 'mdi:shield-crown-outline', to: '/admin', show: hasRole('ADMIN') },
    { label: 'Guide Dashboard', desc: 'Manage your guide profile', icon: 'mdi:compass-outline', to: '/guide', show: hasRole('GUIDE') },
    { label: 'Company Dashboard', desc: 'Manage your company', icon: 'mdi:domain', to: '/company', show: hasRole('COMPANY_OWNER') },
  ]

  const visibleLinks = quickLinks.filter((l) => l.show)

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 md:py-16 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-ocean text-2xl font-bold text-white shadow-lg shadow-brand-ocean/20">
          {initials}
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {fullName?.split(' ')[0] ?? 'there'}
          </h1>
          <p className="text-sm text-gray-500">{email}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
            {roles.map((r) => (
              <span key={r} className={roleBadge(r)}>{r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {visibleLinks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Quick Access</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="card flex items-center gap-4 p-4 no-underline transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sand text-brand-ocean">
                  <Icon icon={link.icon} className="text-xl" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{link.label}</div>
                  <div className="text-xs text-gray-500">{link.desc}</div>
                </div>
                <Icon icon="mdi:chevron-right" className="ml-auto text-lg text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Account Info Card */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Account Information</h2>
        <div className="divide-y divide-gray-100">
          <InfoRow icon="mdi:account-outline" label="Full Name" value={fullName ?? '—'} />
          <InfoRow icon="mdi:email-outline" label="Email" value={email ?? '—'} />
          <InfoRow
            icon="mdi:shield-check-outline"
            label="Roles"
            value={roles.length > 0 ? roles.join(', ') : 'No roles assigned'}
          />
        </div>
      </div>

      {/* Help */}
      <div className="card-sand p-5 flex items-start gap-3">
        <Icon icon="mdi:information-outline" className="mt-0.5 text-xl text-brand-gold flex-shrink-0" />
        <div>
          <div className="text-sm font-medium text-brand-ocean">Need help?</div>
          <p className="mt-0.5 text-xs text-gray-500">
            Contact our support team or visit the help center for assistance with your account.
          </p>
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
