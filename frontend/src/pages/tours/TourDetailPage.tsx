import { useEffect, useRef, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { getTourDetail, createCheckout } from '../../shared/api/tours'
import type { TourSession } from '../../shared/api/tours'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

const STOP_COLORS: Record<string, string> = {
  SLEEP: '#7c3aed',
  EAT: '#f59e0b',
  VISIT: '#0ea5e9',
  TRANSPORT: '#6b7280',
}

export function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const tourId = Number(id)
  const valid = !isNaN(tourId) && tourId > 0
  const mapContainer = useRef<HTMLDivElement>(null)

  const tourQuery = useQuery({
    queryKey: ['tour-detail', tourId],
    queryFn: ({ signal }) => getTourDetail(tourId, signal),
    enabled: valid,
  })

  const bookMutation = useMutation({
    mutationFn: (sessionId: number) => createCheckout(sessionId),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl
    },
  })

  const tour = tourQuery.data
  const orderedStops = useMemo(
    () => [...(tour?.stops ?? [])].sort((a, b) => a.position - b.position),
    [tour?.stops],
  )

  // Map
  useEffect(() => {
    if (!mapContainer.current || orderedStops.length === 0) return

    const coords = orderedStops
      .filter((s) => s.placeLatitude != null && s.placeLongitude != null)
      .map((s) => [s.placeLongitude!, s.placeLatitude!] as [number, number])

    if (coords.length === 0) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: coords[0],
      zoom: 12,
      attributionControl: false,
    })

    const onReady = () => {
      coords.forEach((c, i) => {
        const stop = orderedStops[i]
        const color = STOP_COLORS[stop.stopKind ?? ''] ?? '#0E2A47'

        const el = document.createElement('div')
        el.style.cssText = `width:28px;height:28px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);`
        el.textContent = String(i + 1)

        new maplibregl.Marker({ element: el })
          .setLngLat(c)
          .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(
            `<strong>${stop.placeName}</strong>${stop.placeAddress ? `<br><span style="font-size:11px;color:#666">${stop.placeAddress}</span>` : ''}`
          ))
          .addTo(map)
      })

      if (coords.length > 1) {
        map.addSource('route-line', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } },
        })
        map.addLayer({
          id: 'route-line-layer',
          type: 'line',
          source: 'route-line',
          paint: { 'line-color': '#0E2A47', 'line-width': 3, 'line-dasharray': [2, 2] },
        })
      }

      if (coords.length > 1) {
        const bounds = new maplibregl.LngLatBounds()
        coords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 50, maxZoom: 14 })
      }
    }

    map.once('load', onReady)
    return () => { map.remove() }
  }, [orderedStops])

  if (!valid) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 text-center">
        <p className="text-gray-500">Invalid tour ID.</p>
        <Link to="/tours" className="text-brand-ocean mt-2 inline-block">← Back to tours</Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      {/* Back link */}
      <Link to="/tours" className="text-sm text-brand-ocean hover:text-brand-ocean-hover no-underline">
        ← All Tours
      </Link>

      {/* Loading */}
      {tourQuery.isLoading && (
        <div className="card p-10 flex items-center justify-center gap-2 text-gray-500">
          <Icon icon="mdi:loading" className="animate-spin text-xl" />
          Loading tour…
        </div>
      )}
      {tourQuery.isError && <div className="alert-error">Failed to load tour details.</div>}

      {tour && (
        <>
          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge-ocean text-[10px]">{tour.cityName}</span>
                  <span className="flex items-center gap-1 text-xs text-role-guide">
                    <Icon icon="mdi:account-tie" className="text-sm" />
                    {tour.guideName}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">{tour.name}</h1>
                {tour.notes && <p className="mt-2 text-sm text-gray-500 max-w-xl">{tour.notes}</p>}
              </div>
              {tour.priceMad != null && (
                <div className="flex-shrink-0 mt-2 sm:mt-0">
                  <div className="rounded-2xl bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 border border-brand-gold/20 px-6 py-3 text-center">
                    <span className="block text-2xl font-extrabold text-brand-gold">{tour.priceMad} MAD</span>
                    <span className="text-[10px] uppercase tracking-wider text-brand-gold-hover font-semibold">per person</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Map */}
          <div className="card overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Route Map</span>
              <span className="text-xs text-gray-400">{orderedStops.length} stop{orderedStops.length !== 1 ? 's' : ''}</span>
            </div>
            <div ref={mapContainer} className="w-full" style={{ height: 380 }} />
          </div>

          {/* Stops list */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              <Icon icon="mdi:map-marker-path" className="inline mr-1 text-base align-text-bottom text-brand-ocean" />
              Tour Stops
            </h2>
            {orderedStops.length === 0 ? (
              <p className="text-sm text-gray-400">No stops listed for this tour.</p>
            ) : (
              <ol className="space-y-3">
                {orderedStops.map((stop, idx) => {
                  const color = STOP_COLORS[stop.stopKind ?? ''] ?? '#0E2A47'
                  return (
                    <li key={stop.id} className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">{stop.placeName}</span>
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {stop.placeCategory && (
                            <span className="text-[10px] uppercase tracking-wide text-gray-400">{stop.placeCategory}</span>
                          )}
                          {stop.stopKind && (
                            <span className="text-[10px] uppercase tracking-wide font-medium" style={{ color }}>{stop.stopKind}</span>
                          )}
                          {stop.durationMinutes != null && stop.durationMinutes > 0 && (
                            <span className="text-[10px] text-gray-400">
                              {stop.durationMinutes >= 60
                                ? `${Math.floor(stop.durationMinutes / 60)}h${stop.durationMinutes % 60 > 0 ? ` ${stop.durationMinutes % 60}m` : ''}`
                                : `${stop.durationMinutes}m`}
                            </span>
                          )}
                        </div>
                        {stop.placeAddress && (
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">{stop.placeAddress}</div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          {/* Sessions / Book */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              <Icon icon="mdi:calendar-clock" className="inline mr-1 text-base align-text-bottom text-brand-ocean" />
              Available Sessions
            </h2>

            {bookMutation.isError && (
              <div className="alert-error text-sm mb-3">
                {(bookMutation.error as Error)?.message || 'Failed to start checkout. Please try again.'}
              </div>
            )}

            {tour.sessions.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming sessions available.</p>
            ) : (
              <div className="space-y-3">
                {tour.sessions.map((s: TourSession) => {
                  const start = new Date(s.startDateTime)
                  const end = s.endDateTime ? new Date(s.endDateTime) : null
                  const isFull = s.maxParticipants != null && s.availablePlaces <= 0
                  const alreadyBooked = s.userBooked

                  return (
                    <div key={s.id} className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border px-4 py-3 ${alreadyBooked ? 'border-brand-success/30 bg-brand-success/5' : 'border-gray-100 bg-gray-50/50'}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Icon icon="mdi:calendar-check" className="text-lg text-brand-ocean flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-sm text-gray-600">
                            {start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            {end && ` – ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 ml-7">
                          {s.maxParticipants != null && (
                            <span className="text-xs text-gray-500 flex items-center gap-0.5">
                              <Icon icon="mdi:account-group" className="text-sm" />
                              {s.availablePlaces} / {s.maxParticipants} places left
                            </span>
                          )}
                          {s.bookedCount > 0 && (
                            <span className="text-xs text-gray-400">
                              {s.bookedCount} booked
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={alreadyBooked || isFull || bookMutation.isPending}
                        onClick={() => bookMutation.mutate(s.id)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                          alreadyBooked
                            ? 'bg-brand-success/10 text-brand-success border border-brand-success/30 cursor-default'
                            : isFull
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-brand-gold to-brand-gold-hover text-brand-dark hover:shadow-md'
                        } disabled:opacity-80`}
                      >
                        {alreadyBooked ? (
                          <><Icon icon="mdi:check-circle" /> Already Booked</>
                        ) : bookMutation.isPending ? (
                          <><Icon icon="mdi:loading" className="animate-spin" /> Processing…</>
                        ) : isFull ? (
                          'Fully Booked'
                        ) : (
                          <><Icon icon="mdi:credit-card-outline" /> Book Now</>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
