import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import {
  useListCities,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
  useAddCityName,
  useUpdateCityName,
  useDeleteCityName,
  getListCitiesQueryKey,
} from '../../shared/api/admin-city-controller/admin-city-controller'
import type { CityResponse, CityNameResponse, CreateCityRequest, CityNameRequest } from '../../shared/api/model'
import { detectTextDirection, detectTextLang } from '../../shared/textDirection'

const LANG_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
  { code: 'amz', label: 'ⵜⴰⵎⴰⵣⵉⵖⵜ' },
]

export function AdminCitiesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingCity, setEditingCity] = useState<CityResponse | null>(null)
  const [namesCity, setNamesCity] = useState<CityResponse | null>(null)

  const cities = useListCities()
  const invalidate = () => qc.invalidateQueries({ queryKey: getListCitiesQueryKey() })

  const createMut = useCreateCity({
    mutation: { onSuccess: () => { invalidate(); setShowCreate(false) } },
  })
  const updateMut = useUpdateCity({
    mutation: { onSuccess: () => { invalidate(); setEditingCity(null) } },
  })
  const deleteMut = useDeleteCity({ mutation: { onSuccess: invalidate } })

  const filtered = (cities.data ?? []).filter((c) => {
    const q = search.toLowerCase()
    const nameMatch = (c.names ?? []).some((n) => (n.name ?? '').toLowerCase().includes(q))
    return nameMatch || (c.region ?? '').toLowerCase().includes(q)
  })

  const getPrimaryName = (city: CityResponse) => {
    const primary = (city.names ?? []).find((n) => n.primary)
    return primary?.name ?? (city.names ?? [])[0]?.name ?? '—'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Cities</h2>
          <p className="text-sm text-gray-500">{cities.data?.length ?? 0} total cities</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 !w-64"
              placeholder="Search cities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
            <Icon icon="mdi:plus" className="text-lg" />
            <span className="hidden sm:inline">Add City</span>
          </button>
        </div>
      </div>

      {cities.isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((city) => (
          <div key={city.id} className="card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-sm font-semibold text-gray-900"
                  dir={detectTextDirection(getPrimaryName(city))}
                  lang={detectTextLang(getPrimaryName(city))}
                >
                  {getPrimaryName(city)}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">{city.region}</p>
                {city.description && (
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2">{city.description}</p>
                )}
              </div>
              {city.image && (
                <img src={city.image} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
              )}
            </div>

            {/* Names badges */}
            <div className="flex flex-wrap gap-1">
              {(city.names ?? []).map((n) => (
                <span
                  key={n.id}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    n.primary
                      ? 'bg-brand-ocean/10 text-brand-ocean'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <span className="uppercase">{n.languageCode}</span>
                  <span dir={detectTextDirection(n.name)} lang={detectTextLang(n.name)}>
                    {n.name}
                  </span>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:map-marker-outline" className="text-sm" />
                {city.placeCount ?? 0} place{(city.placeCount ?? 0) !== 1 ? 's' : ''}
              </span>
              <span>
                {city.latitude?.toFixed(4)}, {city.longitude?.toFixed(4)}
              </span>
              <span>{city.createdAt ? new Date(city.createdAt).toLocaleDateString() : '—'}</span>
            </div>

            <div className="flex items-center gap-1 border-t border-gray-100 pt-3">
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                title="Edit city"
                onClick={() => setEditingCity(city)}
              >
                <Icon icon="mdi:pencil-outline" className="text-lg" />
              </button>
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                title="Manage names"
                onClick={() => setNamesCity(city)}
              >
                <Icon icon="mdi:translate" className="text-lg" />
              </button>
              <button
                type="button"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                title="Delete"
                onClick={() => { if (confirm(`Delete "${getPrimaryName(city)}"?`)) deleteMut.mutate({ id: city.id! }) }}
              >
                <Icon icon="mdi:trash-can-outline" className="text-lg" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !cities.isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">No cities found.</p>
      )}

      {/* Create City Modal */}
      {showCreate && (
        <Modal title="Add City" onClose={() => setShowCreate(false)}>
          <CreateCityForm
            onSave={(data) => createMut.mutate({ data })}
            saving={createMut.isPending}
          />
        </Modal>
      )}

      {/* Edit City Modal */}
      {editingCity && (
        <Modal title="Edit City" onClose={() => setEditingCity(null)}>
          <EditCityForm
            city={editingCity}
            onSave={(data) => updateMut.mutate({ id: editingCity.id!, data })}
            saving={updateMut.isPending}
          />
        </Modal>
      )}

      {/* Manage Names Modal */}
      {namesCity && (
        <Modal title={`Names — ${getPrimaryName(namesCity)}`} onClose={() => { setNamesCity(null); invalidate() }}>
          <ManageNamesPanel cityId={namesCity.id!} names={namesCity.names ?? []} />
        </Modal>
      )}
    </div>
  )
}

/* ── Modal Shell ─────────────────────────────────────────────── */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
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

/* ── Create City Form ────────────────────────────────────────── */

function CreateCityForm({ onSave, saving }: { onSave: (data: CreateCityRequest) => void; saving: boolean }) {
  const [region, setRegion] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [names, setNames] = useState<CityNameRequest[]>([{ languageCode: 'en', name: '', primary: true }])

  const updateName = (idx: number, field: keyof CityNameRequest, value: string | boolean) => {
    setNames((prev) => prev.map((n, i) => (i === idx ? { ...n, [field]: value } : n)))
  }
  const removeName = (idx: number) => setNames((prev) => prev.filter((_, i) => i !== idx))
  const addName = () => {
    const used = new Set(names.map((n) => n.languageCode))
    const next = LANG_OPTIONS.find((l) => !used.has(l.code))
    if (next) setNames((prev) => [...prev, { languageCode: next.code, name: '', primary: false }])
  }

  const canSubmit = region.trim() && latitude && longitude && names.length > 0 && names.every((n) => n.name.trim())

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSave({
          region: region.trim(),
          description: description || undefined,
          image: image || undefined,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          names,
        })
      }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Region *</label>
        <input className="input" placeholder="e.g. Marrakech-Safi" value={region} onChange={(e) => setRegion(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Latitude *</label>
          <input className="input" type="number" step="any" placeholder="31.6295" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Longitude *</label>
          <input className="input" type="number" step="any" placeholder="-7.9811" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Image URL</label>
        <input className="input" placeholder="https://…" value={image} onChange={(e) => setImage(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
        <textarea className="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Names */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600">City Names *</label>
          {names.length < LANG_OPTIONS.length && (
            <button type="button" className="text-xs text-brand-ocean hover:underline" onClick={addName}>+ Add language</button>
          )}
        </div>
        {names.map((n, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              className="input !w-24 flex-shrink-0"
              value={n.languageCode}
              onChange={(e) => updateName(idx, 'languageCode', e.target.value)}
            >
              {LANG_OPTIONS.map((l) => (
                <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
              ))}
            </select>
            <input
              className="input flex-1"
              placeholder="City name…"
              value={n.name}
              onChange={(e) => updateName(idx, 'name', e.target.value)}
            />
            <label className="flex items-center gap-1 text-[10px] text-gray-500 whitespace-nowrap">
              <input
                type="checkbox"
                checked={n.primary ?? false}
                onChange={(e) => updateName(idx, 'primary', e.target.checked)}
              />
              Primary
            </label>
            {names.length > 1 && (
              <button type="button" className="text-gray-400 hover:text-red-500" onClick={() => removeName(idx)}>
                <Icon icon="mdi:close" className="text-base" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={!canSubmit || saving}>
          {saving ? 'Creating…' : 'Create City'}
        </button>
      </div>
    </form>
  )
}

/* ── Edit City Form ──────────────────────────────────────────── */

function EditCityForm({
  city,
  onSave,
  saving,
}: {
  city: CityResponse
  onSave: (data: { region?: string; description?: string; image?: string; latitude?: number; longitude?: number }) => void
  saving: boolean
}) {
  const [region, setRegion] = useState(city.region ?? '')
  const [description, setDescription] = useState(city.description ?? '')
  const [image, setImage] = useState(city.image ?? '')
  const [latitude, setLatitude] = useState(String(city.latitude ?? ''))
  const [longitude, setLongitude] = useState(String(city.longitude ?? ''))

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          region,
          description,
          image: image || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
        })
      }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Region</label>
        <input className="input" value={region} onChange={(e) => setRegion(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Latitude</label>
          <input className="input" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Longitude</label>
          <input className="input" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Image URL</label>
        <input className="input" value={image} onChange={(e) => setImage(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
        <textarea className="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

/* ── Manage Names Panel ──────────────────────────────────────── */

function ManageNamesPanel({ cityId, names: initialNames }: { cityId: number; names: CityNameResponse[] }) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: getListCitiesQueryKey() })

  const [names, setNames] = useState(initialNames)
  const [addLang, setAddLang] = useState('')
  const [addNameVal, setAddNameVal] = useState('')
  const [addPrimary, setAddPrimary] = useState(false)

  const addMut = useAddCityName({
    mutation: {
      onSuccess: (data) => {
        setNames((prev) => [...prev, data])
        setAddLang('')
        setAddNameVal('')
        setAddPrimary(false)
        invalidate()
      },
    },
  })

  const updateMut = useUpdateCityName({ mutation: { onSuccess: invalidate } })
  const deleteMut = useDeleteCityName({
    mutation: {
      onSuccess: (_data, vars) => {
        setNames((prev) => prev.filter((n) => n.id !== vars.nameId))
        invalidate()
      },
    },
  })

  const usedLangs = new Set(names.map((n) => n.languageCode))
  const availableLangs = LANG_OPTIONS.filter((l) => !usedLangs.has(l.code))

  return (
    <div className="space-y-4">
      {/* Existing names */}
      <div className="space-y-2">
        {names.map((n) => (
          <NameRow
            key={n.id}
            name={n}
            onUpdate={(data) => updateMut.mutate({ cityId, nameId: n.id!, data })}
            onDelete={() => {
              if (confirm(`Delete "${n.name}" (${n.languageCode})?`))
                deleteMut.mutate({ cityId, nameId: n.id! })
            }}
            saving={updateMut.isPending}
          />
        ))}
        {names.length === 0 && (
          <p className="text-sm text-gray-400">No names yet.</p>
        )}
      </div>

      {/* Add new name */}
      {availableLangs.length > 0 && (
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <label className="text-xs font-medium text-gray-600">Add Translation</label>
          <div className="flex items-center gap-2">
            <select
              className="input !w-24 flex-shrink-0"
              value={addLang}
              onChange={(e) => setAddLang(e.target.value)}
            >
              <option value="">Lang</option>
              {availableLangs.map((l) => (
                <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
              ))}
            </select>
            <input
              className="input flex-1"
              placeholder="Name…"
              value={addNameVal}
              onChange={(e) => setAddNameVal(e.target.value)}
            />
            <label className="flex items-center gap-1 text-[10px] text-gray-500 whitespace-nowrap">
              <input type="checkbox" checked={addPrimary} onChange={(e) => setAddPrimary(e.target.checked)} />
              Primary
            </label>
            <button
              type="button"
              className="btn-primary !px-3 !py-1.5 text-xs"
              disabled={!addLang || !addNameVal.trim() || addMut.isPending}
              onClick={() => {
                if (addLang && addNameVal.trim()) {
                  addMut.mutate({ cityId, data: { languageCode: addLang, name: addNameVal.trim(), primary: addPrimary } })
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Single Name Row ─────────────────────────────────────────── */

function NameRow({
  name,
  onUpdate,
  onDelete,
  saving,
}: {
  name: CityNameResponse
  onUpdate: (data: CityNameRequest) => void
  onDelete: () => void
  saving: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(name.name ?? '')
  const [primary, setPrimary] = useState(name.primary ?? false)

  if (!editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
        <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-600">
          {name.languageCode}
        </span>
        <span
          className="flex-1 text-sm text-gray-900"
          dir={detectTextDirection(name.name)}
          lang={detectTextLang(name.name)}
        >
          {name.name}
        </span>
        {name.primary && (
          <span className="rounded-full bg-brand-ocean/10 px-2 py-0.5 text-[10px] font-medium text-brand-ocean">
            Primary
          </span>
        )}
        <button type="button" className="text-gray-400 hover:text-gray-700" onClick={() => setEditing(true)}>
          <Icon icon="mdi:pencil-outline" className="text-base" />
        </button>
        <button type="button" className="text-gray-400 hover:text-red-500" onClick={onDelete}>
          <Icon icon="mdi:trash-can-outline" className="text-base" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-brand-ocean/20 bg-blue-50/30 px-3 py-2">
      <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-600">
        {name.languageCode}
      </span>
      <input className="input flex-1 !py-1" value={val} onChange={(e) => setVal(e.target.value)} />
      <label className="flex items-center gap-1 text-[10px] text-gray-500 whitespace-nowrap">
        <input type="checkbox" checked={primary} onChange={(e) => setPrimary(e.target.checked)} />
        Primary
      </label>
      <button
        type="button"
        className="text-xs text-brand-ocean hover:underline"
        disabled={saving}
        onClick={() => {
          onUpdate({ languageCode: name.languageCode!, name: val.trim(), primary })
          setEditing(false)
        }}
      >
        Save
      </button>
      <button type="button" className="text-xs text-gray-400 hover:underline" onClick={() => setEditing(false)}>
        Cancel
      </button>
    </div>
  )
}
