import { Navigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/AuthContext'

export function AdminPage() {
  const { isAuthenticated, hasRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasRole('ADMIN')) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-zinc-300">Admin-only dashboard placeholder.</p>
    </div>
  )
}
