import { Navigate } from 'react-router-dom'
import { useAuth } from '../../app/auth/AuthContext'

export function DashboardPage() {
  const { isAuthenticated, email, fullName, roles } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
        <div>
          <span className="text-gray-500">Name:</span> {fullName ?? 'unknown'}
        </div>
        <div>
          <span className="text-gray-500">Email:</span> {email ?? 'unknown'}
        </div>
        <div>
          <span className="text-gray-500">Roles:</span> {roles.length > 0 ? roles.join(', ') : 'none'}
        </div>
      </div>
    </div>
  )
}
