import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import {
  useListRoles,
  useCreateRole,
  useDeleteRole,
  getListRolesQueryKey,
} from '../../shared/api/admin-controller/admin-controller'

export function AdminRolesPage() {
  const qc = useQueryClient()
  const [newRoleName, setNewRoleName] = useState('')
  const [error, setError] = useState('')

  const roles = useListRoles()
  const invalidate = () => qc.invalidateQueries({ queryKey: getListRolesQueryKey() })

  const createMut = useCreateRole({
    mutation: {
      onSuccess: () => { invalidate(); setNewRoleName(''); setError('') },
      onError: (err: Error) => setError(err.message || 'Failed to create role'),
    },
  })

  const deleteMut = useDeleteRole({
    mutation: {
      onSuccess: invalidate,
      onError: (err: Error) => setError(err.message || 'Failed to delete role'),
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
        <p className="text-sm text-gray-500">Create and manage system roles.</p>
      </div>

      {/* Create Role */}
      <div className="card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Create New Role</h3>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const trimmed = newRoleName.trim()
            if (trimmed) createMut.mutate({ data: { name: trimmed } })
          }}
        >
          <input
            className="input flex-1"
            placeholder="Type role name (e.g. MODERATOR)…"
            value={newRoleName}
            onChange={(e) => { setNewRoleName(e.target.value); setError('') }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!newRoleName.trim() || createMut.isPending}
          >
            {createMut.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {error && <p className="alert-error">{error}</p>}
      </div>

      {/* Roles List */}
      {roles.isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(roles.data ?? []).map((role) => (
          <div
            key={role.id}
            className="card flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-ocean/10 text-brand-ocean">
                <Icon icon="mdi:shield-account" className="text-lg" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{role.name ?? ''}</div>
                <div className="text-xs text-gray-500">
                  {role.userCount ?? 0} user{(role.userCount ?? 0) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <button
              type="button"
              title="Delete role"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
              disabled={deleteMut.isPending}
              onClick={() => {
                if ((role.userCount ?? 0) > 0) {
                  setError(`Cannot delete "${role.name}" — it's assigned to ${role.userCount} user(s)`)
                  return
                }
                if (confirm(`Delete role "${role.name}"?`)) deleteMut.mutate({ id: role.id! })
              }}
            >
              <Icon icon="mdi:trash-can-outline" className="text-lg" />
            </button>
          </div>
        ))}
      </div>
      {(roles.data ?? []).length === 0 && !roles.isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">No roles found.</p>
      )}
    </div>
  )
}
