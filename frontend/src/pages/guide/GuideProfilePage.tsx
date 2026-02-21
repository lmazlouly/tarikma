import { Icon } from '@iconify/react'
import { useAuth } from '../../app/auth/AuthContext'

export function GuideProfilePage() {
  const { fullName, email } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <p className="mt-1 text-sm text-gray-500">Your guide profile information.</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-role-guide/10">
            <Icon icon="mdi:account-outline" className="text-3xl text-role-guide" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{fullName ?? '—'}</div>
            <div className="text-sm text-gray-500">{email ?? '—'}</div>
            <span className="mt-1 inline-flex items-center rounded-full bg-role-guide/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-role-guide">
              Guide
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
