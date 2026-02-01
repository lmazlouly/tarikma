import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function RootLayout() {
  const { isAuthenticated, hasRole, logout } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Tarik.ma
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-200">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-white">
                  Dashboard
                </Link>
                {hasRole('ADMIN') ? (
                  <Link to="/admin" className="hover:text-white">
                    Admin
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="hover:text-white"
                  onClick={() => logout()}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-white">
                  Login
                </Link>
                <Link to="/register" className="hover:text-white">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
