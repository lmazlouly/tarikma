import { Icon } from '@iconify/react'
import { Link } from 'react-router-dom'
import { useListUsers, useListCompanies, useListGuides, useListRoles } from '../../shared/api/admin-controller/admin-controller'
import { useListCities, useListAllPlaces } from '../../shared/api/admin-city-controller/admin-city-controller'

export function AdminOverviewPage() {
  const users = useListUsers()
  const companies = useListCompanies()
  const guides = useListGuides()
  const roles = useListRoles()
  const cities = useListCities()
  const places = useListAllPlaces()

  const stats = [
    { label: 'Users', count: users.data?.length ?? 0, icon: 'mdi:account-group-outline', path: '/admin/users', color: 'bg-blue-50 text-blue-600' },
    { label: 'Companies', count: companies.data?.length ?? 0, icon: 'mdi:domain', path: '/admin/companies', color: 'bg-amber-50 text-amber-600' },
    { label: 'Guides', count: guides.data?.length ?? 0, icon: 'mdi:compass-outline', path: '/admin/guides', color: 'bg-teal-50 text-teal-600' },
    { label: 'Roles', count: roles.data?.length ?? 0, icon: 'mdi:shield-account-outline', path: '/admin/roles', color: 'bg-purple-50 text-purple-600' },
    { label: 'Cities', count: cities.data?.length ?? 0, icon: 'mdi:city-variant-outline', path: '/admin/cities', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Places', count: places.data?.length ?? 0, icon: 'mdi:map-marker-outline', path: '/admin/places', color: 'bg-rose-50 text-rose-600' },
  ]

  const pendingGuides = guides.data?.filter((g) => g.verificationStatus === 'pending').length ?? 0
  const unverifiedCompanies = companies.data?.filter((c) => !c.verified).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Admin Overview</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your platform from here.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.path}
            className="card flex items-center gap-4 p-5 no-underline transition-shadow hover:shadow-md"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${s.color}`}>
              <Icon icon={s.icon} className="text-xl" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.count}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(pendingGuides > 0 || unverifiedCompanies > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Needs Attention</h3>
          {pendingGuides > 0 && (
            <Link
              to="/admin/guides"
              className="alert-warning flex items-center gap-2 no-underline"
            >
              <Icon icon="mdi:alert-circle-outline" className="text-lg flex-shrink-0" />
              <span>{pendingGuides} guide{pendingGuides > 1 ? 's' : ''} pending verification</span>
            </Link>
          )}
          {unverifiedCompanies > 0 && (
            <Link
              to="/admin/companies"
              className="alert-warning flex items-center gap-2 no-underline"
            >
              <Icon icon="mdi:alert-circle-outline" className="text-lg flex-shrink-0" />
              <span>{unverifiedCompanies} compan{unverifiedCompanies > 1 ? 'ies' : 'y'} not verified</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
