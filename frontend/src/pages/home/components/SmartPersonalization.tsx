import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'

export function SmartPersonalization() {
  return (
    <section className="px-6 py-20">
      <motion.div
        className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center shadow-sm md:p-12"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-ocean/10">
          <Icon icon="mdi:auto-fix" className="text-3xl text-brand-ocean-light" />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-gray-900 md:text-3xl">
          Not sure what to book?
        </h2>

        <p className="mx-auto mt-4 max-w-md text-gray-500">
          Answer 4 quick questions and we'll design your perfect city plan —
          powered by smart matching, not brochures.
        </p>

        <Link 
          to="/plan/circuits?ai=true"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-ocean px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-ocean/25 transition hover:bg-brand-ocean-hover hover:shadow-brand-ocean/40 no-underline"
        >
          <Icon icon="mdi:magic-staff" className="text-lg" />
          Get My Personalized Plan
        </Link>
      </motion.div>
    </section>
  )
}
