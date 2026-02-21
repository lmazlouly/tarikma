import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../auth/AuthContext'

type NavItem = {
  label: string
  path: string
  icon: string
}

const adminNav: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: 'mdi:view-dashboard-outline' },
  { label: 'Users', path: '/admin/users', icon: 'mdi:account-group-outline' },
  { label: 'Companies', path: '/admin/companies', icon: 'mdi:domain' },
  { label: 'Company Members', path: '/admin/company-members', icon: 'mdi:account-multiple-outline' },
  { label: 'Guides', path: '/admin/guides', icon: 'mdi:compass-outline' },
  { label: 'Roles', path: '/admin/roles', icon: 'mdi:shield-account-outline' },
  { label: 'Cities', path: '/admin/cities', icon: 'mdi:city-variant-outline' },
  { label: 'Places', path: '/admin/places', icon: 'mdi:map-marker-outline' },
]

const guideNav: NavItem[] = [
  { label: 'Overview', path: '/guide', icon: 'mdi:view-dashboard-outline' },
  { label: 'My Tours', path: '/plan/circuits', icon: 'mdi:map-marker-path' },
  { label: 'Bookings', path: '/guide/bookings', icon: 'mdi:calendar-check-outline' },
  { label: 'My Profile', path: '/guide/profile', icon: 'mdi:account-outline' },
]

const companyNav: NavItem[] = [
  { label: 'Overview', path: '/company', icon: 'mdi:view-dashboard-outline' },
  { label: 'Members', path: '/company/members', icon: 'mdi:account-group-outline' },
  { label: 'Bookings', path: '/company/bookings', icon: 'mdi:calendar-check-outline' },
]

function getSidebarConfig(hasRole: (role: string) => boolean, pathname: string) {
  if (pathname.startsWith('/admin') && hasRole('ADMIN')) {
    return { title: 'Admin Panel', items: adminNav }
  }
  if (pathname.startsWith('/guide') && hasRole('GUIDE')) {
    return { title: 'Guide Dashboard', items: guideNav }
  }
  if (pathname.startsWith('/company') && hasRole('COMPANY_OWNER')) {
    return { title: 'Company Dashboard', items: companyNav }
  }
  return { title: 'Dashboard', items: [] }
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { hasRole, fullName, logout } = useAuth()
  const location = useLocation()
  const { title, items } = getSidebarConfig(hasRole, location.pathname)

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/guide' || path === '/company') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-5">
        <Link to="/" className="text-lg font-bold tracking-tight text-gray-900 no-underline">
          Tarik<span className="text-brand-gold">.ma</span>
        </Link>
        {!collapsed && (
          <span className="ml-auto rounded-md bg-brand-ocean/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-ocean">
            {title.split(' ')[0]}
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors
                ${active
                  ? 'bg-brand-ocean text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon icon={item.icon} className="text-lg flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-4 space-y-2">
        {!collapsed && (
          <div className="px-3 text-xs text-gray-400 truncate">
            {fullName}
          </div>
        )}
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-500 no-underline transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Icon icon="mdi:home-outline" className="text-lg flex-shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Icon icon="mdi:logout" className="text-lg flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col border-r border-gray-200 bg-white transition-all duration-300
          ${collapsed ? 'w-[68px]' : 'w-64'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white
          transform transition-transform duration-300 md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            <Icon icon="mdi:menu" className="text-xl" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            className="hidden md:flex rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon
              icon={collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'}
              className="text-xl"
            />
          </button>

          <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
