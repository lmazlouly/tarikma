import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMyCircuit, listCircuitPlanningWarnings, aiReorderStops, aiSuggestPlaces, updateCircuit, listSessions, createSession, deleteSession as deleteSessionApi } from '../../shared/api/circuits'
import type { CircuitStop } from '../../shared/api/circuits'
import { customInstance } from '../../shared/api/orval-mutator'
import { addStop, deleteStop, updateStop } from '../../shared/api/circuit-controller/circuit-controller'
import type { UpdateCircuitStopRequest } from '../../shared/api/model'
import { PlanningWarningsPanel } from '../../features/planningWarnings/PlanningWarningsPanel'
import { ensureRTLPlugin } from '../../shared/mapRtlPlugin'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

const STOP_KIND_COLORS: Record<string, string> = {
  SLEEP: '#7c3aed',
  EAT: '#f59e0b',
  VISIT: '#10b981',
  TRANSPORT: '#0ea5e9',
}

const CATEGORY_COLORS: Record<string, string> = {
  HOTEL: '#7c3aed',
  RESTAURANT: '#f59e0b',
  CAFE: '#f59e0b',
  MUSEUM: '#10b981',
  MOSQUE: '#10b981',
  PARK: '#10b981',
  BEACH: '#10b981',
  MARKET: '#10b981',
  MONUMENT: '#10b981',
  HISTORIC: '#10b981',
  LANDMARK: '#10b981',
  NATURE: '#10b981',
  TRANSPORT_HUB: '#0ea5e9',
}

const STOP_KIND_ICONS: Record<string, string> = {
  SLEEP: 'mdi:bed-outline',
  EAT: 'mdi:silverware-fork-knife',
  VISIT: 'mdi:map-marker-outline',
  TRANSPORT: 'mdi:bus-outline',
}

const CATEGORY_ICONS: Record<string, string> = {
  RESTAURANT: 'mdi:silverware-fork-knife',
  CAFE: 'mdi:coffee-outline',
  HOTEL: 'mdi:bed-outline',
  MUSEUM: 'mdi:bank-outline',
  MOSQUE: 'mdi:mosque',
  PARK: 'mdi:tree-outline',
  BEACH: 'mdi:beach',
  MARKET: 'mdi:store-outline',
  MONUMENT: 'mdi:pillar',
  HISTORIC: 'mdi:castle',
  LANDMARK: 'mdi:map-marker-star-outline',
  NATURE: 'mdi:pine-tree',
  TRANSPORT_HUB: 'mdi:bus-marker',
}

function getStopColor(stop: CircuitStop): string {
  const kind = (stop.stopKind ?? '').trim().toUpperCase()
  if (kind && STOP_KIND_COLORS[kind]) return STOP_KIND_COLORS[kind]
  const cat = (stop.placeCategory ?? '').trim().toUpperCase()
  if (cat && CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat]
  return '#6b7280'
}

function getStopIcon(stop: CircuitStop): string {
  const kind = (stop.stopKind ?? '').trim().toUpperCase()
  if (kind && STOP_KIND_ICONS[kind]) return STOP_KIND_ICONS[kind]
  const cat = (stop.placeCategory ?? '').trim().toUpperCase()
  if (cat && CATEGORY_ICONS[cat]) return CATEGORY_ICONS[cat]
  return 'mdi:map-marker-outline'
}

interface StopTimings {
  [stopId: number]: {
    hours: number
    minutes: number
    sourceMinutes: number | null
  }
}

export function CircuitPlanningPage() {
  const params = useParams()
  const circuitId = Number(params.id)
  const valid = Number.isFinite(circuitId) && circuitId > 0

  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const mapReady = useRef(false)
  const queryClient = useQueryClient()
  const [stopTimings, setStopTimings] = useState<StopTimings>({})
  const [editingPrice, setEditingPrice] = useState(false)
  const [priceInput, setPriceInput] = useState('')
  const [showAiSuggest, setShowAiSuggest] = useState(false)
  const [aiSuggestPrefs, setAiSuggestPrefs] = useState('')
  const [aiSuggestCount, setAiSuggestCount] = useState(3)
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [newPlaceName, setNewPlaceName] = useState('')
  const [newPlaceCategory, setNewPlaceCategory] = useState('')
  const [newPlaceLat, setNewPlaceLat] = useState('')
  const [newPlaceLng, setNewPlaceLng] = useState('')
  const [newPlaceAddress, setNewPlaceAddress] = useState('')
  const [showAddSession, setShowAddSession] = useState(false)
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [sessionEndDate, setSessionEndDate] = useState('')
  const [sessionEndTime, setSessionEndTime] = useState('')
  const [sessionMaxParticipants, setSessionMaxParticipants] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')

  const circuitQuery = useQuery({
    queryKey: ['my-circuit', circuitId],
    queryFn: ({ signal }) => getMyCircuit(circuitId, signal),
    enabled: valid,
  })

  const warningsQuery = useQuery({
    queryKey: ['circuit-planning-warnings', circuitId],
    queryFn: ({ signal }) => listCircuitPlanningWarnings(circuitId, signal),
    enabled: valid,
  })

  const reorderMutation = useMutation({
    mutationFn: ({ stopId, position }: { stopId: number; position: number }) =>
      updateStop(circuitId, stopId, { position }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-circuit', circuitId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (stopId: number) => deleteStop(circuitId, stopId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-circuit', circuitId] })
    },
  })

  const durationMutation = useMutation({
    mutationFn: ({ stopId, durationMinutes }: { stopId: number; durationMinutes: number }) =>
      updateStop(
        circuitId,
        stopId,
        { durationMinutes } as unknown as UpdateCircuitStopRequest,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-circuit', circuitId] })
    },
  })

  const aiReorderMutation = useMutation({
    mutationFn: () => aiReorderStops(circuitId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-circuit', circuitId] })
    },
  })

  const priceMutation = useMutation({
    mutationFn: (priceMad: number) => updateCircuit(circuitId, { priceMad }),
    onSuccess: async () => {
      setEditingPrice(false)
      await queryClient.invalidateQueries({ queryKey: ['my-circuit', circuitId] })
    },
  })

  const aiSuggestMutation = useMutation({
    mutationFn: () => aiSuggestPlaces(circuitId, { count: aiSuggestCount, preferences: aiSuggestPrefs || undefined }),
    onSuccess: async () => {
      setShowAiSuggest(false)
      setAiSuggestPrefs('')
      await queryClient.invalidateQueries({ queryKey: ['my-circuit', circuitId] })
    },
  })

  const addPlaceMutation = useMutation({
    mutationFn: (data: { name: string; category: string; latitude: number; longitude: number; address?: string }) => {
      return customInstance<{ id: number }>({
        url: `/api/cities/${circuit!.cityId}/places`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data,
      }).then((place: { id: number }) =>
        addStop(circuitId, { placeId: place.id })
      )
    },
    onSuccess: async () => {
      setShowAddPlace(false)
      setNewPlaceName('')
      setNewPlaceCategory('')
      setNewPlaceLat('')
      setNewPlaceLng('')
      setNewPlaceAddress('')
      await queryClient.invalidateQueries({ queryKey: ['my-circuit', circuitId] })
    },
  })

  const sessionsQuery = useQuery({
    queryKey: ['circuit-sessions', circuitId],
    queryFn: ({ signal }) => listSessions(circuitId, signal),
    enabled: valid,
  })

  const createSessionMutation = useMutation({
    mutationFn: () => {
      const startDt = new Date(`${sessionDate}T${sessionTime}`).toISOString()
      const endDt = sessionEndDate && sessionEndTime ? new Date(`${sessionEndDate}T${sessionEndTime}`).toISOString() : undefined
      const maxP = sessionMaxParticipants ? parseInt(sessionMaxParticipants) : undefined
      return createSession(circuitId, {
        startDateTime: startDt,
        endDateTime: endDt,
        maxParticipants: maxP,
        notes: sessionNotes || undefined,
      })
    },
    onSuccess: async () => {
      setShowAddSession(false)
      setSessionDate('')
      setSessionTime('')
      setSessionEndDate('')
      setSessionEndTime('')
      setSessionMaxParticipants('')
      setSessionNotes('')
      await queryClient.invalidateQueries({ queryKey: ['circuit-sessions', circuitId] })
    },
  })

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: number) => deleteSessionApi(circuitId, sessionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['circuit-sessions', circuitId] })
    },
  })

  const circuit = circuitQuery.data
  const warnings = warningsQuery.data ?? []
  const sessions = sessionsQuery.data ?? []

  const orderedStops = useMemo(
    () => [...(circuit?.stops ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [circuit?.stops],
  )

  useEffect(() => {
    if (orderedStops.length === 0) return
    setStopTimings((prev) => {
      const next: StopTimings = { ...prev }
      let changed = false

      for (const stop of orderedStops) {
        const minutes = stop.durationMinutes ?? 0
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        const existing = prev[stop.id]
        if (!existing || existing.sourceMinutes !== minutes) {
          next[stop.id] = { hours, minutes: mins, sourceMinutes: minutes }
          changed = true
        }
      }

      for (const key of Object.keys(next)) {
        const id = Number(key)
        if (!orderedStops.some((stop) => stop.id === id)) {
          delete next[id]
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [orderedStops])

  const totalMinutes = orderedStops.reduce((sum, stop) => {
    const timing = stopTimings[stop.id]
    const minutes = timing ? (timing.hours * 60) + timing.minutes : (stop.durationMinutes ?? 0)
    return sum + minutes
  }, 0)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
    if (hours > 0) return `${hours}h`
    return `${mins}m`
  }

  const updateStopTiming = (stopId: number, field: 'hours' | 'minutes', value: number) => {
    setStopTimings((prev) => ({
      ...prev,
      [stopId]: {
        ...(prev[stopId] ?? { hours: 0, minutes: 0, sourceMinutes: null }),
        [field]: Math.max(0, value),
        sourceMinutes: null,
      },
    }))
  }

  const commitStopTiming = (stop: CircuitStop) => {
    const timing = stopTimings[stop.id]
    if (!timing) return
    const durationMinutes = (timing.hours * 60) + timing.minutes
    if (durationMinutes === (stop.durationMinutes ?? 0)) return
    durationMutation.mutate({ stopId: stop.id, durationMinutes })
  }

  useEffect(() => {
    if (!mapContainer.current) return
    if (mapRef.current) return

    ensureRTLPlugin()

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-5.813, 35.785],
      zoom: 11,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map

    map.once('load', () => {
      mapReady.current = true
      map.resize()
    })

    return () => {
      map.remove()
      mapRef.current = null
      mapReady.current = false
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !circuit) return

    const stops = orderedStops.filter(
      (s) => s.placeLatitude != null && s.placeLongitude != null,
    )
    if (stops.length === 0) return

    const renderOverlay = () => {
      const ROUTE_SRC = 'cp-route'
      const ROUTE_LAYER = 'cp-route-layer'
      const STOPS_SRC = 'cp-stops'
      const STOPS_LAYER = 'cp-stops-layer'
      const LABELS_LAYER = 'cp-stops-labels'

      for (const l of [LABELS_LAYER, STOPS_LAYER, ROUTE_LAYER]) {
        if (map.getLayer(l)) map.removeLayer(l)
      }
      for (const s of [STOPS_SRC, ROUTE_SRC]) {
        if (map.getSource(s)) map.removeSource(s)
      }

      const segmentFeatures = stops.slice(0, -1).map((from, idx) => {
        const to = stops[idx + 1]
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [from.placeLongitude!, from.placeLatitude!],
              [to.placeLongitude!, to.placeLatitude!],
            ],
          },
          properties: { color: getStopColor(to) },
        }
      })

      map.addSource(ROUTE_SRC, {
        type: 'geojson',
        data: { type: 'FeatureCollection' as const, features: segmentFeatures },
      })
      map.addLayer({
        id: ROUTE_LAYER,
        type: 'line',
        source: ROUTE_SRC,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.9 },
      })

      const stopFeatures = stops.map((s, idx) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [s.placeLongitude!, s.placeLatitude!],
        },
        properties: { label: String(idx + 1), color: getStopColor(s) },
      }))

      map.addSource(STOPS_SRC, {
        type: 'geojson',
        data: { type: 'FeatureCollection' as const, features: stopFeatures },
      })
      map.addLayer({
        id: STOPS_LAYER,
        type: 'circle',
        source: STOPS_SRC,
        paint: {
          'circle-radius': 8,
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })
      map.addLayer({
        id: LABELS_LAYER,
        type: 'symbol',
        source: STOPS_SRC,
        layout: { 'text-field': ['get', 'label'], 'text-size': 11, 'text-allow-overlap': true },
        paint: { 'text-color': '#ffffff' },
      })

      const first = stops[0]
      const bounds = new maplibregl.LngLatBounds(
        [first.placeLongitude!, first.placeLatitude!],
        [first.placeLongitude!, first.placeLatitude!],
      )
      for (const s of stops.slice(1)) bounds.extend([s.placeLongitude!, s.placeLatitude!])
      map.fitBounds(bounds, { padding: 60, duration: 600, maxZoom: 14 })
    }

    if (mapReady.current && map.isStyleLoaded()) {
      renderOverlay()
    } else {
      const onReady = () => {
        mapReady.current = true
        renderOverlay()
      }
      map.once('load', onReady)
      return () => { map.off('load', onReady) }
    }
  }, [circuit, orderedStops])

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/plan/circuits" className="text-sm text-brand-ocean hover:text-brand-ocean-hover no-underline">
            ← My Plans
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {circuit?.name ?? 'Plan'}
          </h1>
          {circuit?.cityName && (
            <p className="mt-0.5 text-sm text-gray-500">{circuit.cityName}</p>
          )}
          {circuit && (
            <div className="mt-1.5 flex items-center gap-2">
              {editingPrice ? (
                <form className="flex items-center gap-1.5" onSubmit={(e) => { e.preventDefault(); priceMutation.mutate(parseFloat(priceInput) || 0) }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                    autoFocus
                  />
                  <span className="text-xs text-gray-500">MAD</span>
                  <button type="submit" disabled={priceMutation.isPending} className="rounded bg-brand-ocean px-2 py-1 text-xs font-semibold text-white disabled:opacity-60">
                    {priceMutation.isPending ? '…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setEditingPrice(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                </form>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-brand-gold/10 px-2.5 py-0.5 text-xs font-semibold text-brand-gold-hover hover:bg-brand-gold/20 transition"
                  onClick={() => { setPriceInput(circuit.priceMad != null ? String(circuit.priceMad) : ''); setEditingPrice(true) }}
                >
                  <Icon icon="mdi:currency-usd" className="text-sm" />
                  {circuit.priceMad != null ? `${circuit.priceMad} MAD` : 'Set price'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Link
            to={`/plan${circuit ? `?cityId=${circuit.cityId}&circuitId=${circuit.id}` : ''}`}
            className="btn-primary px-4 py-2 text-sm no-underline"
          >
            <Icon icon="mdi:map-plus" className="mr-1.5 text-base" />
            Add stops
          </Link>
        </div>
      </div>

      {circuitQuery.isLoading && (
        <div className="card p-6 flex items-center gap-2 text-sm text-gray-600">
          <Icon icon="mdi:loading" className="animate-spin text-lg" />
          Loading plan...
        </div>
      )}
      {circuitQuery.isError && <div className="alert-error">Failed to load plan.</div>}
      {warningsQuery.isError && <div className="alert-error">Failed to load warnings.</div>}

      {valid && <PlanningWarningsPanel circuitId={circuitId} warnings={warnings} />}

      {circuit && (
        <>
          {/* Mini-map */}
          <div className="card overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Route map</span>
              <span className="text-xs text-gray-400">{orderedStops.length} stop{orderedStops.length !== 1 ? 's' : ''}</span>
            </div>
            <div
              ref={mapContainer}
              className="w-full"
              style={{ height: 320 }}
            />
          </div>

          {/* Stops list with timing */}
          <div className="card p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Stops</span>
              <div className="flex items-center gap-2">
                {totalMinutes > 0 && (
                  <span className="inline-flex items-center rounded-full bg-brand-sand px-3 py-1 text-xs font-semibold text-brand-ocean">
                    Total duration: {formatDuration(totalMinutes)}
                  </span>
                )}
                {orderedStops.length >= 2 && (
                  <button
                    type="button"
                    disabled={aiReorderMutation.isPending}
                    onClick={() => aiReorderMutation.mutate()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-ocean to-brand-ocean-light px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
                  >
                    {aiReorderMutation.isPending ? (
                      <>
                        <Icon icon="mdi:loading" className="animate-spin text-sm" />
                        Rearranging…
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:auto-fix" className="text-sm" />
                        Rearrange with AI
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            {aiReorderMutation.isError && (
              <div className="alert-error mb-3 text-sm">
                {(aiReorderMutation.error as Error)?.message || 'AI rearrangement failed. Please try again.'}
              </div>
            )}
            {orderedStops.length === 0 ? (
              <p className="text-sm text-gray-400">No stops yet. Go to the map to add places.</p>
            ) : (
              <ol className="space-y-2">
                {orderedStops.map((stop, idx) => {
                  const color = getStopColor(stop)
                  const icon = getStopIcon(stop)
                  const canMoveUp = idx > 0
                  const canMoveDown = idx < orderedStops.length - 1
                  return (
                    <li key={stop.id} className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon icon={icon} className="text-sm flex-shrink-0" style={{ color }} />
                          <span className="text-sm font-medium text-gray-900 truncate">{stop.placeName}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {stop.placeCategory && (
                            <span className="text-[10px] uppercase tracking-wide text-gray-400">{stop.placeCategory}</span>
                          )}
                          {stop.stopKind && (
                            <span className="text-[10px] uppercase tracking-wide font-medium" style={{ color }}>{stop.stopKind}</span>
                          )}
                          {stop.dayNumber && (
                            <span className="text-[10px] text-gray-400">Day {stop.dayNumber}</span>
                          )}
                          {stop.startTime && stop.endTime && (
                            <span className="text-[10px] text-gray-400">{stop.startTime} – {stop.endTime}</span>
                          )}
                        </div>
                        {stop.placeAddress && (
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">{stop.placeAddress}</div>
                        )}
                        <div className="mt-3 rounded-lg border border-brand-sand bg-brand-sand-light/60 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-brand-ocean">Stop duration</span>
                            {stopTimings[stop.id] && (
                              <span className="text-[11px] text-gray-500">
                                {formatDuration((stopTimings[stop.id].hours * 60) + stopTimings[stop.id].minutes)}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                            <label className="text-[11px] text-gray-500">
                              Hours
                              <input
                                type="number"
                                min="0"
                                max="23"
                                inputMode="numeric"
                                value={stopTimings[stop.id]?.hours ?? 0}
                                onChange={(e) => updateStopTiming(stop.id, 'hours', parseInt(e.target.value) || 0)}
                                onBlur={() => commitStopTiming(stop)}
                                className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                              />
                            </label>
                            <label className="text-[11px] text-gray-500">
                              Minutes
                              <input
                                type="number"
                                min="0"
                                max="59"
                                inputMode="numeric"
                                value={stopTimings[stop.id]?.minutes ?? 0}
                                onChange={(e) => updateStopTiming(stop.id, 'minutes', parseInt(e.target.value) || 0)}
                                onBlur={() => commitStopTiming(stop)}
                                className="mt-1 w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => commitStopTiming(stop)}
                              disabled={durationMutation.isPending}
                              className="mt-5 rounded-md bg-brand-ocean px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-60"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-center sm:gap-1">
                        <button
                          type="button"
                          className="rounded-full border border-gray-200 p-1 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                          disabled={!canMoveUp || reorderMutation.isPending}
                          onClick={() => {
                            if (!canMoveUp) return
                            reorderMutation.mutate({ stopId: stop.id, position: idx })
                          }}
                          aria-label="Move stop up"
                        >
                          <Icon icon="mdi:chevron-up" className="text-base" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-gray-200 p-1 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                          disabled={!canMoveDown || reorderMutation.isPending}
                          onClick={() => {
                            if (!canMoveDown) return
                            reorderMutation.mutate({ stopId: stop.id, position: idx + 2 })
                          }}
                          aria-label="Move stop down"
                        >
                          <Icon icon="mdi:chevron-down" className="text-base" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-red-200 p-1 text-red-500 hover:text-red-600 disabled:opacity-40"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(stop.id)}
                          aria-label="Remove stop"
                        >
                          <Icon icon="mdi:trash-can-outline" className="text-base" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          {/* Action buttons: AI Suggest + Add Place */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowAiSuggest(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-ocean to-brand-ocean-light px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <Icon icon="mdi:robot-happy" className="text-base" />
              AI Suggest Places
            </button>
            <button
              type="button"
              onClick={() => setShowAddPlace(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-brand-ocean hover:text-brand-ocean"
            >
              <Icon icon="mdi:map-marker-plus" className="text-base" />
              Add New Place
            </button>
          </div>

          {/* Sessions */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                <Icon icon="mdi:calendar-clock" className="inline mr-1 text-base align-text-bottom" />
                Scheduled Sessions
              </span>
              <button
                type="button"
                onClick={() => setShowAddSession(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-ocean px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-ocean-hover transition"
              >
                <Icon icon="mdi:plus" className="text-sm" />
                Add Session
              </button>
            </div>

            {sessionsQuery.isLoading && (
              <p className="text-sm text-gray-400 flex items-center gap-1.5">
                <Icon icon="mdi:loading" className="animate-spin" /> Loading sessions…
              </p>
            )}
            {sessionsQuery.isError && (
              <div className="alert-error text-sm">Failed to load sessions.</div>
            )}

            {sessions.length === 0 && !sessionsQuery.isLoading && (
              <p className="text-sm text-gray-400">No sessions scheduled yet. Add one to set when this circuit will run.</p>
            )}

            {sessions.length > 0 && (
              <div className="space-y-2">
                {sessions.map((s) => {
                  const start = new Date(s.startDateTime)
                  const end = s.endDateTime ? new Date(s.endDateTime) : null
                  const isPast = start.getTime() < Date.now()
                  const statusColor =
                    s.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    s.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    s.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    isPast ? 'bg-gray-100 text-gray-500' :
                    'bg-brand-sand text-brand-ocean'

                  return (
                    <div key={s.id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Icon icon="mdi:calendar-check" className="text-lg text-brand-ocean" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-sm text-gray-600">
                            {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            {end && ` – ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusColor}`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {s.maxParticipants != null && (
                            <span className="text-xs text-gray-500 flex items-center gap-0.5">
                              <Icon icon="mdi:account-group" className="text-sm" />
                              Max {s.maxParticipants}
                            </span>
                          )}
                          {s.notes && (
                            <span className="text-xs text-gray-500 truncate max-w-[200px]">{s.notes}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteSessionMutation.mutate(s.id)}
                        disabled={deleteSessionMutation.isPending}
                        className="flex-shrink-0 rounded-full border border-red-200 p-1 text-red-400 hover:text-red-600 disabled:opacity-40 transition"
                        aria-label="Delete session"
                      >
                        <Icon icon="mdi:trash-can-outline" className="text-sm" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {deleteSessionMutation.isError && (
              <div className="alert-error text-sm mt-2">Failed to delete session.</div>
            )}
          </div>
        </>
      )}

      {/* AI Suggest Places Modal */}
      {showAiSuggest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !aiSuggestMutation.isPending && setShowAiSuggest(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:robot-happy" className="text-2xl text-brand-ocean" />
                <h3 className="text-lg font-bold text-gray-900">AI Suggest Places</h3>
              </div>
              <button onClick={() => setShowAiSuggest(false)} disabled={aiSuggestMutation.isPending} className="text-gray-400 hover:text-gray-600 text-xl">
                <Icon icon="mdi:close" />
              </button>
            </div>
            <div className="px-6 pb-2">
              <p className="text-sm text-gray-500">AI will suggest real places in {circuit?.cityName ?? 'the city'} and add them to your circuit.</p>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">How many places?</label>
                <div className="flex gap-2">
                  {[2, 3, 5, 7].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAiSuggestCount(n)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition ${aiSuggestCount === n ? 'border-brand-ocean bg-brand-ocean text-white' : 'border-gray-200 text-gray-600 hover:border-brand-ocean'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Preferences (optional)</label>
                <input
                  type="text"
                  value={aiSuggestPrefs}
                  onChange={(e) => setAiSuggestPrefs(e.target.value)}
                  placeholder="e.g. restaurants, beaches, historic sites…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                />
              </div>
              {aiSuggestMutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  <Icon icon="mdi:alert-circle" />
                  {(aiSuggestMutation.error as Error)?.message || 'Failed to suggest places.'}
                </div>
              )}
            </div>
            <div className="px-6 pb-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAiSuggest(false)} disabled={aiSuggestMutation.isPending} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => aiSuggestMutation.mutate()}
                disabled={aiSuggestMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-ocean to-brand-ocean-light px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              >
                {aiSuggestMutation.isPending ? (
                  <><Icon icon="mdi:loading" className="animate-spin" /> Suggesting…</>
                ) : (
                  <><Icon icon="mdi:auto-fix" /> Suggest Places</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Place Modal */}
      {showAddPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !addPlaceMutation.isPending && setShowAddPlace(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:map-marker-plus" className="text-2xl text-brand-ocean" />
                <h3 className="text-lg font-bold text-gray-900">Add New Place</h3>
              </div>
              <button onClick={() => setShowAddPlace(false)} disabled={addPlaceMutation.isPending} className="text-gray-400 hover:text-gray-600 text-xl">
                <Icon icon="mdi:close" />
              </button>
            </div>
            <div className="px-6 pb-2">
              <p className="text-sm text-gray-500">Create a new place in {circuit?.cityName ?? 'the city'} and add it as a stop.</p>
            </div>
            <form
              className="px-6 py-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const lat = parseFloat(newPlaceLat)
                const lng = parseFloat(newPlaceLng)
                if (!newPlaceName.trim() || isNaN(lat) || isNaN(lng)) return
                addPlaceMutation.mutate({
                  name: newPlaceName.trim(),
                  category: newPlaceCategory || 'LANDMARK',
                  latitude: lat,
                  longitude: lng,
                  address: newPlaceAddress || undefined,
                })
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name *</label>
                <input
                  type="text"
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="e.g. Café Hafa"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                <select
                  value={newPlaceCategory}
                  onChange={(e) => setNewPlaceCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                >
                  <option value="">Select…</option>
                  {['RESTAURANT', 'CAFE', 'HOTEL', 'MUSEUM', 'MOSQUE', 'PARK', 'BEACH', 'MARKET', 'MONUMENT', 'HISTORIC', 'LANDMARK', 'NATURE'].map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</label>
                <input
                  type="text"
                  value={newPlaceAddress}
                  onChange={(e) => setNewPlaceAddress(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={newPlaceLat}
                    onChange={(e) => setNewPlaceLat(e.target.value)}
                    placeholder="e.g. 35.785"
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={newPlaceLng}
                    onChange={(e) => setNewPlaceLng(e.target.value)}
                    placeholder="e.g. -5.813"
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                  />
                </div>
              </div>
              {addPlaceMutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  <Icon icon="mdi:alert-circle" />
                  {(addPlaceMutation.error as Error)?.message || 'Failed to add place.'}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPlace(false)} disabled={addPlaceMutation.isPending} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPlaceMutation.isPending || !newPlaceName.trim() || !newPlaceLat || !newPlaceLng}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ocean px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                >
                  {addPlaceMutation.isPending ? (
                    <><Icon icon="mdi:loading" className="animate-spin" /> Adding…</>
                  ) : (
                    <><Icon icon="mdi:plus" /> Add Place & Stop</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !createSessionMutation.isPending && setShowAddSession(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon icon="mdi:calendar-plus" className="text-2xl text-brand-ocean" />
                <h3 className="text-lg font-bold text-gray-900">Schedule Session</h3>
              </div>
              <button onClick={() => setShowAddSession(false)} disabled={createSessionMutation.isPending} className="text-gray-400 hover:text-gray-600 text-xl">
                <Icon icon="mdi:close" />
              </button>
            </div>
            <div className="px-6 pb-2">
              <p className="text-sm text-gray-500">Set when this circuit will take place.</p>
            </div>
            <form
              className="px-6 py-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (!sessionDate || !sessionTime) return
                createSessionMutation.mutate()
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Date</label>
                  <input
                    type="date"
                    value={sessionEndDate}
                    onChange={(e) => setSessionEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Time</label>
                  <input
                    type="time"
                    value={sessionEndTime}
                    onChange={(e) => setSessionEndTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Participants</label>
                <input
                  type="number"
                  min="1"
                  value={sessionMaxParticipants}
                  onChange={(e) => setSessionMaxParticipants(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
                <input
                  type="text"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Optional notes for this session"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-ocean"
                />
              </div>
              {createSessionMutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  <Icon icon="mdi:alert-circle" />
                  {(createSessionMutation.error as Error)?.message || 'Failed to create session.'}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddSession(false)} disabled={createSessionMutation.isPending} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSessionMutation.isPending || !sessionDate || !sessionTime}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-ocean px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                >
                  {createSessionMutation.isPending ? (
                    <><Icon icon="mdi:loading" className="animate-spin" /> Scheduling…</>
                  ) : (
                    <><Icon icon="mdi:calendar-check" /> Schedule</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
