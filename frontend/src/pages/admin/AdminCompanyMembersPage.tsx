import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import {
  useListAllCompanyMembers,
  useListCompanies,
  useListUsers,
  useRemoveCompanyMember,
  useAddCompanyMember,
  getListAllCompanyMembersQueryKey,
} from '../../shared/api/admin-controller/admin-controller'

export function AdminCompanyMembersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const members = useListAllCompanyMembers()
  const companies = useListCompanies()
  const users = useListUsers()

  const invalidate = () => qc.invalidateQueries({ queryKey: getListAllCompanyMembersQueryKey() })

  const removeMut = useRemoveCompanyMember({
    mutation: { onSuccess: invalidate },
  })

  const addMut = useAddCompanyMember({
    mutation: { onSuccess: () => { invalidate(); setShowAdd(false) } },
  })

  const filtered = (members.data ?? []).filter(
    (m) =>
      (m.userFullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (m.companyName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (m.userEmail ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Company Members</h2>
          <p className="text-sm text-gray-500">{members.data?.length ?? 0} total members</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 !w-56"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setShowAdd(true)}>
            <Icon icon="mdi:plus" className="text-lg" /> Add
          </button>
        </div>
      </div>

      {members.isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((m) => (
              <tr key={`${m.companyId}-${m.userId}`} className="hover:bg-gray-50/50">
                <td className="px-3 py-3">
                  <div className="font-medium text-gray-900">{m.userFullName ?? ''}</div>
                  <div className="text-xs text-gray-500">{m.userEmail ?? ''}</div>
                </td>
                <td className="px-3 py-3 text-gray-700">{m.companyName ?? ''}</td>
                <td className="px-3 py-3">
                  <span className="badge-gold capitalize">{m.memberRole ?? ''}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs ${m.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                    <Icon icon={m.status === 'active' ? 'mdi:check-circle' : 'mdi:pause-circle'} className="text-sm" />
                    {m.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    title="Remove member"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => {
                      if (confirm('Remove this member?'))
                        removeMut.mutate({ companyId: m.companyId!, userId: m.userId! })
                    }}
                  >
                    <Icon icon="mdi:account-remove-outline" className="text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !members.isLoading && (
          <p className="py-8 text-center text-sm text-gray-400">No members found.</p>
        )}
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowAdd(false)}>
          <div className="card w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Add Company Member</h3>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <Icon icon="mdi:close" className="text-lg" />
              </button>
            </div>
            <AddMemberForm
              companies={companies.data ?? []}
              users={users.data ?? []}
              onSave={(data) => addMut.mutate({ companyId: data.companyId, data: { userId: data.userId, memberRole: data.memberRole } })}
              saving={addMut.isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function AddMemberForm({
  companies,
  users,
  onSave,
  saving,
}: {
  companies: { id?: number; name?: string }[]
  users: { id?: number; fullName?: string; email?: string }[]
  onSave: (data: { companyId: number; userId: number; memberRole: string }) => void
  saving: boolean
}) {
  const [companyId, setCompanyId] = useState('')
  const [userId, setUserId] = useState('')
  const [memberRole, setMemberRole] = useState('agent')

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (companyId && userId) onSave({ companyId: Number(companyId), userId: Number(userId), memberRole })
      }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Company</label>
        <select className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">Select company…</option>
          {companies.map((c) => <option key={c.id} value={c.id ?? ''}>{c.name ?? ''}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">User</label>
        <select className="input" value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Select user…</option>
          {users.map((u) => <option key={u.id} value={u.id ?? ''}>{u.fullName ?? ''} ({u.email ?? ''})</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Member Role</label>
        <select className="input" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="agent">Agent</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving || !companyId || !userId}>
          {saving ? 'Adding…' : 'Add Member'}
        </button>
      </div>
    </form>
  )
}
