import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { listTours } from '../../shared/api/tours'

export function ToursPage() {
  const [cityFilter, setCityFilter] = useState<number | undefined>(undefined)

  const toursQuery = useQuery({
    queryKey: ['tours', cityFilter],
    queryFn: ({ signal }) => listTours(cityFilter, signal),
  })

  const tours = toursQuery.data ?? []

  const cities = Array.from(
    new Map(tours.map((t) => [t.cityId, t.cityName ?? 'Unknown'])).entries(),
  )

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          className="text-3xl font-extrabold text-brand-ocean md:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Ready-Made Tours
        </motion.h1>
        <motion.p
          className="mt-3 text-gray-500 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Browse guided tours across Morocco. Pick a session, pay securely, and join the adventure.
        </motion.p>
      </div>

      {/* City filter pills */}
      {cities.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setCityFilter(undefined)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
              cityFilter === undefined
                ? 'border-brand-ocean bg-brand-ocean text-white'
                : 'border-gray-200 text-gray-600 hover:border-brand-ocean'
            }`}
          >
            All Cities
          </button>
          {cities.map(([id, name]) => (
            <button
              key={id}
              onClick={() => setCityFilter(id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                cityFilter === id
                  ? 'border-brand-ocean bg-brand-ocean text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-ocean'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {toursQuery.isLoading && (
        <div className="flex justify-center py-20">
          <Icon icon="mdi:loading" className="animate-spin text-3xl text-brand-ocean" />
        </div>
      )}

      {/* Error */}
      {toursQuery.isError && (
        <div className="alert-error text-center">Failed to load tours. Please try again.</div>
      )}

      {/* Empty */}
      {!toursQuery.isLoading && tours.length === 0 && (
        <div className="text-center py-20">
          <Icon icon="mdi:map-search-outline" className="mx-auto text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500">No tours available right now. Check back soon!</p>
        </div>
      )}

      {/* Tour cards grid */}
      {tours.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, idx) => {
            const nextDate = tour.nextSessionAt ? new Date(tour.nextSessionAt) : null
            return (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
              >
                <Link
                  to={`/tours/${tour.id}`}
                  className="block card hover:shadow-lg transition-shadow no-underline group"
                >
                  {/* Card top accent */}
                  <div className="h-1.5 rounded-t-xl bg-gradient-to-r from-brand-ocean to-brand-ocean-light" />

                  <div className="p-5">
                    {/* City badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge-ocean text-[10px]">{tour.cityName}</span>
                      {tour.priceMad != null && (
                        <span className="text-sm font-bold text-brand-gold">{tour.priceMad} MAD</span>
                      )}
                    </div>

                    {/* Tour name */}
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-ocean transition-colors line-clamp-2">
                      {tour.name}
                    </h3>

                    {/* Notes */}
                    {tour.notes && (
                      <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{tour.notes}</p>
                    )}

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:map-marker-path" className="text-sm text-brand-ocean" />
                        {tour.stopCount} stop{tour.stopCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:account-tie" className="text-sm text-role-guide" />
                        {tour.guideName}
                      </span>
                    </div>

                    {/* Next session */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      {nextDate ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-brand-ocean">
                          <Icon icon="mdi:calendar-clock" className="text-sm" />
                          Next: {nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' '}at {nextDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No upcoming sessions</span>
                      )}
                      {tour.upcomingSessionCount > 1 && (
                        <span className="text-[10px] text-gray-400">
                          +{tour.upcomingSessionCount - 1} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}
