import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import {
  useListCompanies,
  useUpdateCompany,
  useDeleteCompany,
  useVerifyCompany,
  useUnverifyCompany,
  getListCompaniesQueryKey,
} from '../../shared/api/admin-controller/admin-controller'
import type { AdminCompanyResponse } from '../../shared/api/model'

export function AdminCompaniesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editingCompany, setEditingCompany] = useState<AdminCompanyResponse | null>(null)

  const companies = useListCompanies()
  const invalidate = () => qc.invalidateQueries({ queryKey: getListCompaniesQueryKey() })

  const updateMut = useUpdateCompany({
    mutation: { onSuccess: () => { invalidate(); setEditingCompany(null) } },
  })

  const deleteMut = useDeleteCompany({ mutation: { onSuccess: invalidate } })
  const verifyMut = useVerifyCompany({ mutation: { onSuccess: invalidate } })
  const unverifyMut = useUnverifyCompany({ mutation: { onSuccess: invalidate } })

  const filtered = (companies.data ?? []).filter(
    (c) => (c.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Companies</h2>
          <p className="text-sm text-gray-500">{companies.data?.length ?? 0} total companies</p>
        </div>
        <div className="relative">
          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 !w-64"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {companies.isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((company) => (
          <div key={company.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{company.name ?? ''}</h3>
                {company.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{company.description}</p>
                )}
              </div>
              {company.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                  <Icon icon="mdi:check-circle" className="text-xs" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  Unverified
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:account-group-outline" className="text-sm" />
                {company.memberCount ?? 0} member{(company.memberCount ?? 0) !== 1 ? 's' : ''}
              </span>
              <span>{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—'}</span>
            </div>

            <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="Edit"
                onClick={() => setEditingCompany(company)}
              >
                <Icon icon="mdi:pencil-outline" className="text-lg" />
              </button>
              {company.verified ? (
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-orange-400 hover:bg-orange-50"
                  title="Unverify"
                  onClick={() => unverifyMut.mutate({ id: company.id! })}
                >
                  <Icon icon="mdi:close-circle-outline" className="text-lg" />
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-green-500 hover:bg-green-50"
                  title="Verify"
                  onClick={() => verifyMut.mutate({ id: company.id! })}
                >
                  <Icon icon="mdi:check-circle-outline" className="text-lg" />
                </button>
              )}
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                title="Delete"
                onClick={() => { if (confirm('Delete this company?')) deleteMut.mutate({ id: company.id! }) }}
              >
                <Icon icon="mdi:trash-can-outline" className="text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && !companies.isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">No companies found.</p>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setEditingCompany(null)}>
          <div className="card w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Edit Company</h3>
              <button type="button" onClick={() => setEditingCompany(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <Icon icon="mdi:close" className="text-lg" />
              </button>
            </div>
            <EditCompanyForm
              company={editingCompany}
              onSave={(data) => updateMut.mutate({ id: editingCompany.id!, data })}
              saving={updateMut.isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function EditCompanyForm({
  company,
  onSave,
  saving,
}: {
  company: AdminCompanyResponse
  onSave: (data: { name?: string; description?: string }) => void
  saving: boolean
}) {
  const [name, setName] = useState(company.name ?? '')
  const [description, setDescription] = useState(company.description ?? '')

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => { e.preventDefault(); onSave({ name, description }) }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Company Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
        <textarea className="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
