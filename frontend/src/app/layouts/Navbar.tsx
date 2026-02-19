import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../auth/AuthContext'

export function Navbar() {
  const { isAuthenticated, hasRole, logout } = useAuth()

  return (
    <>
      {/* Desktop Navbar – hidden on mobile */}
      <header className="hidden md:block fixed top-0 inset-x-0 z-50 border-b border-gray-200 bg-white/30 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
            Tarik<span className="text-brand-gold">.ma</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link to="/" className="transition hover:text-gray-900">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="transition hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/plan/circuits" className="transition hover:text-gray-900">
                  Plans
                </Link>
                {hasRole('ADMIN') && (
                  <Link to="/admin" className="transition hover:text-gray-900">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className="transition hover:text-gray-900"
                  onClick={() => logout()}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="transition hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-brand-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-ocean-hover"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Bar – visible only on mobile */}
      <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-3">
          <Link to="/" className="flex flex-col items-center gap-0.5 text-gray-400 transition hover:text-gray-900">
            <Icon icon="mdi:home-outline" className="text-xl" />
            <span className="text-[10px]">Home</span>
          </Link>

          {isAuthenticated ? (
            <Link to="/plan/circuits" className="flex flex-col items-center gap-0.5 text-gray-400 transition hover:text-gray-900">
              <Icon icon="mdi:map-marker-path" className="text-xl" />
              <span className="text-[10px]">Plans</span>
            </Link>
          ) : (
            <Link to="/plan" className="flex flex-col items-center gap-0.5 text-gray-400 transition hover:text-gray-900">
              <Icon icon="mdi:compass-outline" className="text-xl" />
              <span className="text-[10px]">Explore</span>
            </Link>
          )}

          {/* Center Logo */}
          <Link
            to="/"
            className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-brand-ocean shadow-lg shadow-brand-ocean/30"
          >
            <span className="text-sm font-bold text-white">T</span>
          </Link>

          {isAuthenticated ? (
            <Link to="/dashboard" className="flex flex-col items-center gap-0.5 text-gray-400 transition hover:text-gray-900">
              <Icon icon="mdi:view-dashboard-outline" className="text-xl" />
              <span className="text-[10px]">Dashboard</span>
            </Link>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-0.5 text-gray-400 transition hover:text-gray-900">
              <Icon icon="mdi:login" className="text-xl" />
              <span className="text-[10px]">Login</span>
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className="flex flex-col items-center gap-0.5 text-gray-900 transition hover:text-gray-500"
            >
              <Icon icon="mdi:logout" className="text-xl" />
              <span className="text-[10px]">Logout</span>
            </button>
          ) : (
            <Link to="/register" className="flex flex-col items-center gap-0.5 text-gray-400 transition hover:text-gray-900">
              <Icon icon="mdi:account-outline" className="text-xl" />
              <span className="text-[10px]">Account</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
