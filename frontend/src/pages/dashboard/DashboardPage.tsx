import { Navigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/AuthContext'

export function DashboardPage() {
  const { isAuthenticated, username, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-200">
        <div>
          <span className="text-zinc-400">User:</span> {username ?? 'unknown'}
        </div>
        <div>
          <span className="text-zinc-400">Role:</span> {role ?? 'unknown'}
        </div>
      </div>
    </div>
  )
}
