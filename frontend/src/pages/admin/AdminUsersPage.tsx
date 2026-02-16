import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import {
  useListUsers,
  useListRoles,
  useUpdateUser,
  useDeleteUser,
  useToggleUserEnabled,
  useAssignRole,
  useRemoveRole,
  getListUsersQueryKey,
} from '../../shared/api/admin-controller/admin-controller'
import type { AdminUserResponse } from '../../shared/api/model'

export function AdminUsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<AdminUserResponse | null>(null)
  const [roleModal, setRoleModal] = useState<AdminUserResponse | null>(null)
  const [newRole, setNewRole] = useState('')

  const users = useListUsers()
  const roles = useListRoles()

  const invalidate = () => qc.invalidateQueries({ queryKey: getListUsersQueryKey() })

  const updateMut = useUpdateUser({
    mutation: { onSuccess: () => { invalidate(); setEditingUser(null) } },
  })

  const deleteMut = useDeleteUser({
    mutation: { onSuccess: invalidate },
  })

  const toggleEnabledMut = useToggleUserEnabled({
    mutation: { onSuccess: invalidate },
  })

  const assignRoleMut = useAssignRole({
    mutation: { onSuccess: () => { invalidate(); setNewRole('') } },
  })

  const removeRoleMut = useRemoveRole({
    mutation: { onSuccess: invalidate },
  })

  const filtered = (users.data ?? []).filter(
    (u) =>
      (u.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">{users.data?.length ?? 0} total users</p>
        </div>
        <div className="relative">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 !w-64"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {users.isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Roles</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/50">
                <td className="px-3 py-3">
                  <div className="font-medium text-gray-900">{user.fullName ?? ''}</div>
                  <div className="text-xs text-gray-500">{user.email ?? ''}</div>
                  {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(user.roles ?? []).map((r) => (
                      <span key={r} className="badge-ocean">{r}</span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    {user.verified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <Icon icon="mdi:check-circle" className="text-sm" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <Icon icon="mdi:circle-outline" className="text-sm" /> Unverified
                      </span>
                    )}
                    {!user.enabled && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500">
                        <Icon icon="mdi:block-helper" className="text-sm" /> Disabled
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Edit"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      onClick={() => setEditingUser(user)}
                    >
                      <Icon icon="mdi:pencil-outline" className="text-lg" />
                    </button>
                    <button
                      type="button"
                      title="Manage Roles"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      onClick={() => setRoleModal(user)}
                    >
                      <Icon icon="mdi:shield-account-outline" className="text-lg" />
                    </button>
                    <button
                      type="button"
                      title={user.enabled ? 'Disable' : 'Enable'}
                      className={`rounded-lg p-1.5 ${user.enabled ? 'text-orange-400 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                      onClick={() => toggleEnabledMut.mutate({ id: user.id! })}
                    >
                      <Icon icon={user.enabled ? 'mdi:account-cancel-outline' : 'mdi:account-check-outline'} className="text-lg" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      onClick={() => { if (confirm('Delete this user?')) deleteMut.mutate({ id: user.id! }) }}
                    >
                      <Icon icon="mdi:trash-can-outline" className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !users.isLoading && (
          <p className="py-8 text-center text-sm text-gray-400">No users found.</p>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal onClose={() => setEditingUser(null)} title="Edit User">
          <EditUserForm
            user={editingUser}
            onSave={(data) => updateMut.mutate({ id: editingUser.id!, data })}
            saving={updateMut.isPending}
          />
        </Modal>
      )}

      {/* Role Management Modal */}
      {roleModal && (
        <Modal onClose={() => setRoleModal(null)} title={`Roles — ${roleModal.fullName ?? ''}`}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(roleModal.roles ?? []).map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5 rounded-full bg-brand-ocean/10 px-3 py-1.5 text-xs font-medium text-brand-ocean">
                  {r}
                  <button
                    type="button"
                    onClick={() => removeRoleMut.mutate({ userId: roleModal.id!, roleName: r })}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-brand-ocean/20"
                  >
                    <Icon icon="mdi:close" className="text-xs" />
                  </button>
                </span>
              ))}
              {(roleModal.roles ?? []).length === 0 && (
                <span className="text-xs text-gray-400">No roles assigned</span>
              )}
            </div>
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="">Select role…</option>
                {(roles.data ?? [])
                  .filter((r) => !(roleModal.roles ?? []).includes(r.name ?? ''))
                  .map((r) => (
                    <option key={r.id} value={r.name ?? ''}>{r.name}</option>
                  ))}
              </select>
              <button
                type="button"
                className="btn-primary"
                disabled={!newRole || assignRoleMut.isPending}
                onClick={() => {
                  if (newRole) assignRoleMut.mutate({ id: roleModal.id!, data: { roleName: newRole } })
                }}
              >
                Add
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <Icon icon="mdi:close" className="text-lg" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function EditUserForm({
  user,
  onSave,
  saving,
}: {
  user: AdminUserResponse
  onSave: (data: { fullName?: string; email?: string; phone?: string; verified?: boolean }) => void
  saving: boolean
}) {
  const [fullName, setFullName] = useState(user.fullName ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [phone, setPhone] = useState(user.phone ?? '')
  const [verified, setVerified] = useState(user.verified ?? false)

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ fullName, email, phone, verified })
      }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Full Name</label>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Phone</label>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="rounded" />
        Verified
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
