import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getMyCircuit, listCircuitPlanningWarnings, aiReorderStops } from '../../shared/api/circuits'
import type { CircuitStop } from '../../shared/api/circuits'
import { deleteStop, updateStop } from '../../shared/api/circuit-controller/circuit-controller'
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

  const circuit = circuitQuery.data
  const warnings = warningsQuery.data ?? []

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
        </div>
        <Link
          to={`/plan${circuit ? `?cityId=${circuit.cityId}&circuitId=${circuit.id}` : ''}`}
          className="btn-primary px-4 py-2 text-sm no-underline"
        >
          <Icon icon="mdi:map-plus" className="mr-1.5 text-base" />
          Add stops
        </Link>
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
        </>
      )}
    </section>
  )
}
