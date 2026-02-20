import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import { getBookingByCheckoutId } from '../../shared/api/tours'

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const bookingQuery = useQuery({
    queryKey: ['booking-by-checkout', sessionId],
    queryFn: ({ signal }) => getBookingByCheckoutId(sessionId!, signal),
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 2000,
  })

  const booking = bookingQuery.data

  return (
    <section className="mx-auto max-w-lg px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card p-8"
      >
        {/* Loading */}
        {bookingQuery.isLoading && (
          <div className="flex flex-col items-center gap-3">
            <Icon icon="mdi:loading" className="animate-spin text-4xl text-brand-ocean" />
            <p className="text-gray-500">Confirming your booking…</p>
          </div>
        )}

        {/* Error / no session_id */}
        {(bookingQuery.isError || !sessionId) && !bookingQuery.isLoading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-warning/10 flex items-center justify-center">
              <Icon icon="mdi:alert-circle-outline" className="text-3xl text-brand-warning" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Booking Status Unknown</h2>
            <p className="text-sm text-gray-500">
              We couldn't verify your booking right now. If you completed payment, your booking will be confirmed shortly.
            </p>
            <Link to="/tours" className="btn-primary px-6 py-2.5 text-sm no-underline mt-2">
              Browse Tours
            </Link>
          </div>
        )}

        {/* Success */}
        {booking && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-brand-success/10 flex items-center justify-center"
            >
              <Icon icon="mdi:check-circle" className="text-5xl text-brand-success" />
            </motion.div>

            <h2 className="text-2xl font-extrabold text-gray-900">
              {booking.status === 'CONFIRMED' ? 'Booking Confirmed!' : 'Payment Received!'}
            </h2>

            <p className="text-sm text-gray-500 max-w-sm">
              {booking.status === 'CONFIRMED'
                ? 'Your spot is secured. Get ready for an amazing tour!'
                : 'Your payment is being processed. You\'ll receive confirmation shortly.'}
            </p>

            <div className="w-full mt-4 rounded-xl bg-brand-sand-light border border-brand-sand-muted p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tour</span>
                <span className="font-semibold text-gray-900">{booking.tourName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-700">
                  {new Date(booking.sessionStartDateTime).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-700">
                  {new Date(booking.sessionStartDateTime).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-brand-gold">{booking.amountMad} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Link
                to={`/tours/${booking.circuitId}`}
                className="btn-secondary px-5 py-2.5 text-sm no-underline"
              >
                View Tour
              </Link>
              <Link
                to="/tours"
                className="btn-primary px-5 py-2.5 text-sm no-underline"
              >
                Browse More Tours
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  )
}
