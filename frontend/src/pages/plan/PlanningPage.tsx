import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import maplibregl, { setRTLTextPlugin, getRTLTextPluginStatus } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useListCities1 } from '../../shared/api/city-controller/city-controller'
import { listPlaces } from '../../shared/api/city-controller/city-controller'
import type { CityResponse, PlaceResponse } from '../../shared/api/model'
import { detectTextDirection, detectTextLang, wrapWithAutoDirSpan } from '../../shared/textDirection'

const MOROCCO_CENTER: [number, number] = [-7.5, 31.5]
const MOROCCO_ZOOM = 5.3

const CATEGORY_ICONS: Record<string, string> = {
  RESTAURANT: 'mdi:silverware-fork-knife',
  HOTEL: 'mdi:bed-outline',
  MUSEUM: 'mdi:bank-outline',
  MOSQUE: 'mdi:mosque',
  PARK: 'mdi:tree-outline',
  BEACH: 'mdi:beach',
  MARKET: 'mdi:store-outline',
  MONUMENT: 'mdi:pillar',
}

function getPrimaryName(city: CityResponse) {
  const primary = (city.names ?? []).find((n) => n.primary)
  return primary?.name ?? (city.names ?? [])[0]?.name ?? '—'
}

export function PlanningPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const cities = useListCities1()

  const [selectedCity, setSelectedCity] = useState<CityResponse | null>(null)
  const [cityPlaces, setCityPlaces] = useState<PlaceResponse[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    if (getRTLTextPluginStatus() !== 'loaded') {
      setRTLTextPlugin(
        'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
        true,
      )
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: MOROCCO_CENTER,
      zoom: MOROCCO_ZOOM,
      minZoom: 4,
      maxBounds: [
        [-18, 20],
        [5, 38],
      ],
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []
  }, [])

  // Add city markers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !cities.data) return

    const onReady = () => {
      clearMarkers()

      cities.data!.forEach((city) => {
        if (city.latitude == null || city.longitude == null) return

        const el = document.createElement('div')
        el.className = 'city-marker'
        el.innerHTML = `
          <div class="flex items-center gap-1.5 rounded-full bg-brand-ocean px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer transition hover:bg-brand-ocean-hover hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
            ${wrapWithAutoDirSpan(getPrimaryName(city))}
          </div>
        `

        el.addEventListener('click', () => handleCityClick(city))

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([city.longitude!, city.latitude!])
          .addTo(map)

        markersRef.current.push(marker)
      })
    }

    if (map.loaded()) {
      onReady()
    } else {
      map.on('load', onReady)
    }
  }, [cities.data, clearMarkers])

  // Handle city click — zoom + load places
  const handleCityClick = useCallback(
    async (city: CityResponse) => {
      setSelectedCity(city)
      setSidebarOpen(true)
      setCityPlaces([])
      setLoadingPlaces(true)
      clearMarkers()

      const map = mapRef.current
      if (map && city.latitude != null && city.longitude != null) {
        map.flyTo({
          center: [city.longitude!, city.latitude!],
          zoom: 11,
          duration: 1200,
        })
      }

      try {
        const places = await listPlaces(city.id!)
        setCityPlaces(places)

        // Add place markers
        if (map) {
          places.forEach((place) => {
            if (place.latitude == null || place.longitude == null) return

            const el = document.createElement('div')
            el.className = 'place-marker'
            el.innerHTML = `
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-gold text-brand-dark shadow-md cursor-pointer transition hover:scale-110 hover:bg-brand-gold-hover" title="${place.name ?? ''}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
              </div>
            `

            el.addEventListener('click', (e) => {
              e.stopPropagation()
              const popup = new maplibregl.Popup({ offset: 25, closeButton: true })
                .setLngLat([place.longitude!, place.latitude!])
                .setHTML(`
                  <div class="p-2 min-w-[180px]">
                    ${place.image ? `<img src="${place.image}" alt="" class="w-full h-24 object-cover rounded-lg mb-2" />` : ''}
                    <div class="font-semibold text-sm text-gray-900">${wrapWithAutoDirSpan(place.name ?? '')}</div>
                    ${place.category ? `<span class="inline-block mt-1 text-[10px] font-medium uppercase tracking-wide bg-brand-ocean/10 text-brand-ocean rounded-full px-2 py-0.5">${place.category}</span>` : ''}
                    ${place.address ? `<div class="mt-1 text-xs text-gray-500">${place.address}</div>` : ''}
                    ${place.description ? `<div class="mt-1 text-xs text-gray-400 line-clamp-2">${place.description}</div>` : ''}
                  </div>
                `)
                .addTo(map)

              void popup
            })

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([place.longitude!, place.latitude!])
              .addTo(map)

            markersRef.current.push(marker)
          })
        }
      } catch {
        setCityPlaces([])
      } finally {
        setLoadingPlaces(false)
      }
    },
    [clearMarkers],
  )

  // Back to all cities
  const handleBack = useCallback(() => {
    setSelectedCity(null)
    setCityPlaces([])

    const map = mapRef.current
    if (map) {
      // Remove place markers, re-add city markers
      clearMarkers()

      map.flyTo({
        center: MOROCCO_CENTER,
        zoom: MOROCCO_ZOOM,
        duration: 1000,
      })

      // Re-add city markers
      ;(cities.data ?? []).forEach((city) => {
        if (city.latitude == null || city.longitude == null) return

        const el = document.createElement('div')
        el.className = 'city-marker'
        el.innerHTML = `
          <div class="flex items-center gap-1.5 rounded-full bg-brand-ocean px-3 py-1.5 text-xs font-semibold text-white shadow-lg cursor-pointer transition hover:bg-brand-ocean-hover hover:scale-105">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
            ${wrapWithAutoDirSpan(getPrimaryName(city))}
          </div>
        `
        el.addEventListener('click', () => handleCityClick(city))

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([city.longitude!, city.latitude!])
          .addTo(map)

        markersRef.current.push(marker)
      })
    }
  }, [cities.data, clearMarkers, handleCityClick])

  const flyToPlace = (place: PlaceResponse) => {
    if (!mapRef.current || place.latitude == null || place.longitude == null) return
    mapRef.current.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 15,
      duration: 800,
    })
  }

  return (
    <div className="relative flex h-[calc(100vh-73px)] w-full overflow-hidden md:h-[calc(100vh-73px)]">
      {/* Sidebar */}
      <div
        className={`absolute inset-y-0 left-0 z-10 flex w-80 flex-col bg-white shadow-xl transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
          {selectedCity ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-medium text-brand-ocean transition hover:text-brand-ocean-hover"
            >
              <Icon icon="mdi:arrow-left" className="text-lg" />
              All Cities
            </button>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-brand-ocean transition hover:text-brand-ocean-hover no-underline"
            >
              <Icon icon="mdi:arrow-left" className="text-lg" />
              Home
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
          >
            <Icon icon="mdi:close" className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedCity ? (
            // City list
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900">Explore Morocco</h2>
              <p className="mt-1 text-xs text-gray-500">
                {cities.data?.length ?? 0} cities to discover
              </p>

              {cities.isLoading && (
                <div className="mt-8 flex justify-center">
                  <Icon icon="mdi:loading" className="animate-spin text-2xl text-brand-ocean" />
                </div>
              )}

              <div className="mt-4 space-y-2">
                {(cities.data ?? []).map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCityClick(city)}
                    className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-brand-ocean/30 hover:shadow-sm"
                  >
                    {city.image ? (
                      <img
                        src={city.image}
                        alt=""
                        className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-brand-ocean/10">
                        <Icon icon="mdi:city-variant-outline" className="text-xl text-brand-ocean" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm font-semibold text-gray-900 truncate"
                        dir={detectTextDirection(getPrimaryName(city))}
                        lang={detectTextLang(getPrimaryName(city))}
                      >
                        {getPrimaryName(city)}
                      </div>
                      <div className="text-xs text-gray-500">{city.region}</div>
                      <div className="mt-0.5 text-[10px] text-gray-400">
                        {city.placeCount ?? 0} place{(city.placeCount ?? 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Icon icon="mdi:chevron-right" className="flex-shrink-0 text-lg text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Selected city + places
            <div>
              {/* City header */}
              <div className="relative">
                {selectedCity.image ? (
                  <div className="relative h-40">
                    <img
                      src={selectedCity.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <h2
                        className="text-xl font-bold text-white"
                        dir={detectTextDirection(getPrimaryName(selectedCity))}
                        lang={detectTextLang(getPrimaryName(selectedCity))}
                      >
                        {getPrimaryName(selectedCity)}
                      </h2>
                      <p className="text-xs text-white/80">{selectedCity.region}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <h2
                      className="text-xl font-bold text-gray-900"
                      dir={detectTextDirection(getPrimaryName(selectedCity))}
                      lang={detectTextLang(getPrimaryName(selectedCity))}
                    >
                      {getPrimaryName(selectedCity)}
                    </h2>
                    <p className="text-xs text-gray-500">{selectedCity.region}</p>
                  </div>
                )}
              </div>

              {selectedCity.description && (
                <p className="px-4 pt-3 text-xs text-gray-500 leading-relaxed">
                  {selectedCity.description}
                </p>
              )}

              {/* Name badges */}
              <div className="flex flex-wrap gap-1 px-4 pt-3">
                {(selectedCity.names ?? []).map((n) => (
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

              {/* Places */}
              <div className="px-4 pt-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Places
                  {!loadingPlaces && (
                    <span className="ml-1.5 text-xs font-normal text-gray-400">
                      ({cityPlaces.length})
                    </span>
                  )}
                </h3>

                {loadingPlaces && (
                  <div className="mt-4 flex justify-center">
                    <Icon icon="mdi:loading" className="animate-spin text-xl text-brand-ocean" />
                  </div>
                )}

                <div className="mt-3 space-y-2 pb-4">
                  {cityPlaces.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => flyToPlace(place)}
                      className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-brand-gold/40 hover:shadow-sm"
                    >
                      {place.image ? (
                        <img
                          src={place.image}
                          alt=""
                          className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                          <Icon
                            icon={CATEGORY_ICONS[place.category ?? ''] ?? 'mdi:map-marker-outline'}
                            className="text-lg text-brand-gold"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-sm font-medium text-gray-900 truncate"
                          dir={detectTextDirection(place.name)}
                          lang={detectTextLang(place.name)}
                        >
                          {place.name}
                        </div>
                        {place.category && (
                          <span className="text-[10px] font-medium uppercase tracking-wide text-brand-ocean">
                            {place.category}
                          </span>
                        )}
                        {place.address && (
                          <div className="text-[11px] text-gray-400 truncate">{place.address}</div>
                        )}
                      </div>
                      <Icon icon="mdi:crosshairs-gps" className="flex-shrink-0 text-base text-gray-300" />
                    </button>
                  ))}

                  {!loadingPlaces && cityPlaces.length === 0 && (
                    <p className="py-4 text-center text-xs text-gray-400">
                      No places added to this city yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-medium text-brand-ocean shadow-lg transition hover:shadow-xl md:hidden"
        >
          <Icon icon="mdi:menu" className="text-lg" />
          <span
            dir={detectTextDirection(selectedCity ? getPrimaryName(selectedCity) : '')}
            lang={detectTextLang(selectedCity ? getPrimaryName(selectedCity) : '')}
          >
            {selectedCity ? getPrimaryName(selectedCity) : 'Cities'}
          </span>
        </button>
      )}

      {/* Map */}
      <div ref={mapContainer} className="flex-1" />
    </div>
  )
}
