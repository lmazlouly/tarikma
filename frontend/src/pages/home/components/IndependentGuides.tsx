import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

interface GuideCard {
  name: string
  specialty: string
  languages: string
  rating: string
}

const guides: GuideCard[] = [
  {
    name: 'Youssef B.',
    specialty: 'Marrakech Medina Expert',
    languages: 'Arabic, French, English',
    rating: '4.9',
  },
  {
    name: 'Amina K.',
    specialty: 'Fes Cultural Historian',
    languages: 'Arabic, French, Spanish',
    rating: '4.8',
  },
  {
    name: 'Omar T.',
    specialty: 'Chefchaouen & Rif Mountains',
    languages: 'Arabic, English, German',
    rating: '5.0',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function IndependentGuides() {
  return (
    <section id="guides" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Book a Verified Local Guide
          </h2>
          <p className="mt-3 text-gray-500">
            Independent experts offering personalized city experiences.
          </p>
        </div>

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {guides.map((guide) => (
            <motion.div
              key={guide.name}
              variants={item}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Icon icon="mdi:account-outline" className="text-xl text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{guide.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <Icon icon="mdi:check-circle-outline" className="text-sm" />
                    Verified Independent
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <p>{guide.specialty}</p>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:translate" className="text-base text-gray-400" />
                  {guide.languages}
                </div>
                <div className="flex items-center gap-1">
                  <Icon icon="mdi:star" className="text-sm text-amber-400" />
                  <span className="text-gray-700">{guide.rating}</span>
                </div>
              </div>

              <button className="mt-4 text-sm font-medium text-role-guide transition hover:text-brand-ocean">
                View Profile →
              </button>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            Find a Guide
            <Icon icon="mdi:arrow-right" className="text-base" />
          </a>
        </div>
      </div>
    </section>
  )
}
