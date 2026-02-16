import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import {
  useListCities,
  useListAllPlaces,
  useCreatePlace1,
  useUpdatePlace,
  useDeletePlace,
  getListAllPlacesQueryKey,
  getListCitiesQueryKey,
} from '../../shared/api/admin-city-controller/admin-city-controller'
import type { PlaceResponse, CityResponse, CreatePlaceRequest, UpdatePlaceRequest } from '../../shared/api/model'
import { detectTextDirection, detectTextLang } from '../../shared/textDirection'

export function AdminPlacesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterCityId, setFilterCityId] = useState<number | ''>('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingPlace, setEditingPlace] = useState<PlaceResponse | null>(null)

  const places = useListAllPlaces()
  const cities = useListCities()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListAllPlacesQueryKey() })
    qc.invalidateQueries({ queryKey: getListCitiesQueryKey() })
  }

  const createMut = useCreatePlace1({
    mutation: { onSuccess: () => { invalidate(); setShowCreate(false) } },
  })
  const updateMut = useUpdatePlace({
    mutation: { onSuccess: () => { invalidate(); setEditingPlace(null) } },
  })
  const deleteMut = useDeletePlace({ mutation: { onSuccess: invalidate } })

  const filtered = (places.data ?? []).filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch = (p.name ?? '').toLowerCase().includes(q) ||
      (p.cityName ?? '').toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q) ||
      (p.address ?? '').toLowerCase().includes(q)
    const matchesCity = filterCityId === '' || p.cityId === filterCityId
    return matchesSearch && matchesCity
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Places</h2>
          <p className="text-sm text-gray-500">{places.data?.length ?? 0} total places</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input !w-40"
            value={filterCityId}
            onChange={(e) => setFilterCityId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All cities</option>
            {(cities.data ?? []).map((c) => {
              const name = (c.names ?? []).find((n) => n.primary)?.name ?? (c.names ?? [])[0]?.name ?? `City #${c.id}`
              return (
                <option key={c.id} value={c.id} dir={detectTextDirection(name)} lang={detectTextLang(name)}>
                  {name}
                </option>
              )
            })}
          </select>
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 !w-56"
              placeholder="Search places…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setShowCreate(true)}>
            <Icon icon="mdi:plus" className="text-lg" />
            <span className="hidden sm:inline">Add Place</span>
          </button>
        </div>
      </div>

      {places.isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              <th className="px-3 py-3">Place</th>
              <th className="px-3 py-3">City</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Coordinates</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((place) => (
              <tr key={place.id} className="hover:bg-gray-50/50">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {place.image && (
                      <img src={place.image} alt="" className="h-9 w-9 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div>
                      <div
                        className="font-medium text-gray-900"
                        dir={detectTextDirection(place.name)}
                        lang={detectTextLang(place.name)}
                      >
                        {place.name ?? ''}
                      </div>
                      {place.address && <div className="text-xs text-gray-400 line-clamp-1">{place.address}</div>}
                    </div>
                  </div>
                </td>
                <td
                  className="px-3 py-3 text-gray-600"
                  dir={detectTextDirection(place.cityName)}
                  lang={detectTextLang(place.cityName)}
                >
                  {place.cityName ?? '—'}
                </td>
                <td className="px-3 py-3">
                  {place.category ? (
                    <span className="badge-ocean">{place.category}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {place.createdAt ? new Date(place.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      title="Edit"
                      onClick={() => setEditingPlace(place)}
                    >
                      <Icon icon="mdi:pencil-outline" className="text-lg" />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                      onClick={() => { if (confirm(`Delete "${place.name}"?`)) deleteMut.mutate({ id: place.id! }) }}
                    >
                      <Icon icon="mdi:trash-can-outline" className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && !places.isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">No places found.</p>
      )}

      {/* Create Place Modal */}
      {showCreate && (
        <Modal title="Add Place" onClose={() => setShowCreate(false)}>
          <CreatePlaceForm
            cities={cities.data ?? []}
            onSave={(cityId, data) => createMut.mutate({ cityId, data })}
            saving={createMut.isPending}
          />
        </Modal>
      )}

      {/* Edit Place Modal */}
      {editingPlace && (
        <Modal title="Edit Place" onClose={() => setEditingPlace(null)}>
          <EditPlaceForm
            place={editingPlace}
            onSave={(data) => updateMut.mutate({ id: editingPlace.id!, data })}
            saving={updateMut.isPending}
          />
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

/* ── Create Place Form ───────────────────────────────────────── */

function CreatePlaceForm({
  cities,
  onSave,
  saving,
}: {
  cities: CityResponse[]
  onSave: (cityId: number, data: CreatePlaceRequest) => void
  saving: boolean
}) {
  const [cityId, setCityId] = useState<number | ''>(cities[0]?.id ?? '')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [mapPlaceId, setMapPlaceId] = useState('')

  const getCityName = (c: CityResponse) =>
    (c.names ?? []).find((n) => n.primary)?.name ?? (c.names ?? [])[0]?.name ?? `City #${c.id}`

  const canSubmit = cityId !== '' && name.trim() && latitude && longitude

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSubmit) return
        onSave(Number(cityId), {
          cityId: Number(cityId),
          name: name.trim(),
          description: description || undefined,
          image: image || undefined,
          address: address || undefined,
          category: category || undefined,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          mapPlaceId: mapPlaceId || undefined,
        })
      }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">City *</label>
        <select className="input" value={cityId} onChange={(e) => setCityId(Number(e.target.value))}>
          <option value="" disabled>Select a city…</option>
          {cities.map((c) => {
            const name = getCityName(c)
            return (
              <option key={c.id} value={c.id} dir={detectTextDirection(name)} lang={detectTextLang(name)}>
                {name}
              </option>
            )
          })}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Place Name *</label>
        <input className="input" placeholder="e.g. Jemaa el-Fnaa" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Latitude *</label>
          <input className="input" type="number" step="any" placeholder="31.6258" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Longitude *</label>
          <input className="input" type="number" step="any" placeholder="-7.9891" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
        <input className="input" placeholder="e.g. monument, restaurant, hotel…" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Address</label>
        <input className="input" placeholder="Full address…" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Image URL</label>
        <input className="input" placeholder="https://…" value={image} onChange={(e) => setImage(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
        <textarea className="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Map Place ID</label>
        <input className="input" placeholder="External map reference…" value={mapPlaceId} onChange={(e) => setMapPlaceId(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={!canSubmit || saving}>
          {saving ? 'Creating…' : 'Create Place'}
        </button>
      </div>
    </form>
  )
}

/* ── Edit Place Form ─────────────────────────────────────────── */

function EditPlaceForm({
  place,
  onSave,
  saving,
}: {
  place: PlaceResponse
  onSave: (data: UpdatePlaceRequest) => void
  saving: boolean
}) {
  const [name, setName] = useState(place.name ?? '')
  const [description, setDescription] = useState(place.description ?? '')
  const [image, setImage] = useState(place.image ?? '')
  const [address, setAddress] = useState(place.address ?? '')
  const [category, setCategory] = useState(place.category ?? '')
  const [latitude, setLatitude] = useState(String(place.latitude ?? ''))
  const [longitude, setLongitude] = useState(String(place.longitude ?? ''))
  const [mapPlaceId, setMapPlaceId] = useState(place.mapPlaceId ?? '')

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          name: name.trim() || undefined,
          description: description || undefined,
          image: image || undefined,
          address: address || undefined,
          category: category || undefined,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          mapPlaceId: mapPlaceId || undefined,
        })
      }}
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Place Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
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
        <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
        <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Address</label>
        <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Image URL</label>
        <input className="input" value={image} onChange={(e) => setImage(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
        <textarea className="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Map Place ID</label>
        <input className="input" value={mapPlaceId} onChange={(e) => setMapPlaceId(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
