import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import {
  useListGuides,
  useVerifyGuide,
  useRejectGuide,
  useDeleteGuide,
  getListGuidesQueryKey,
} from '../../shared/api/admin-controller/admin-controller'

export function AdminGuidesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')

  const guides = useListGuides()
  const invalidate = () => qc.invalidateQueries({ queryKey: getListGuidesQueryKey() })

  const verifyMut = useVerifyGuide({ mutation: { onSuccess: invalidate } })
  const rejectMut = useRejectGuide({ mutation: { onSuccess: invalidate } })
  const deleteMut = useDeleteGuide({ mutation: { onSuccess: invalidate } })

  const filtered = (guides.data ?? []).filter((g) => {
    const matchesSearch =
      (g.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (g.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || g.verificationStatus === filter
    return matchesSearch && matchesFilter
  })

  const statusIcon = (status: string) => {
    switch (status) {
      case 'verified': return { icon: 'mdi:check-circle', color: 'text-green-600 bg-green-50' }
      case 'rejected': return { icon: 'mdi:close-circle', color: 'text-red-500 bg-red-50' }
      default: return { icon: 'mdi:clock-outline', color: 'text-amber-600 bg-amber-50' }
    }
  }

  const pendingCount = (guides.data ?? []).filter((g) => g.verificationStatus === 'pending').length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Guides</h2>
          <p className="text-sm text-gray-500">
            {guides.data?.length ?? 0} total guides
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 !w-52"
              placeholder="Search guides…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input !w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {guides.isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((guide) => {
          const si = statusIcon(guide.verificationStatus ?? 'pending')
          return (
            <div key={guide.userId} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{guide.fullName ?? ''}</h3>
                  <p className="text-xs text-gray-500">{guide.email ?? ''}</p>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${si.color}`}>
                  <Icon icon={si.icon} className="text-xs" />
                  {guide.verificationStatus}
                </span>
              </div>

              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Icon icon="mdi:tag-outline" className="text-sm text-gray-400" />
                  <span className="capitalize">{guide.guideType ?? ''}</span>
                </div>
                {guide.languages && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon="mdi:translate" className="text-sm text-gray-400" />
                    <span>{guide.languages}</span>
                  </div>
                )}
                {guide.companyName && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon="mdi:domain" className="text-sm text-gray-400" />
                    <span>{guide.companyName}</span>
                  </div>
                )}
                {guide.bio && (
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">{guide.bio}</p>
                )}
              </div>

              <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
                {guide.verificationStatus !== 'verified' && (
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-green-500 hover:bg-green-50"
                    title="Verify"
                    onClick={() => verifyMut.mutate({ userId: guide.userId! })}
                  >
                    <Icon icon="mdi:check-circle-outline" className="text-lg" />
                  </button>
                )}
                {guide.verificationStatus !== 'rejected' && (
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-orange-400 hover:bg-orange-50"
                    title="Reject"
                    onClick={() => rejectMut.mutate({ userId: guide.userId! })}
                  >
                    <Icon icon="mdi:close-circle-outline" className="text-lg" />
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="Delete"
                  onClick={() => { if (confirm('Delete this guide?')) deleteMut.mutate({ userId: guide.userId! }) }}
                >
                  <Icon icon="mdi:trash-can-outline" className="text-lg" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length === 0 && !guides.isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">No guides found.</p>
      )}
    </div>
  )
}
